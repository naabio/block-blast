"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  createEmptyGrid,
  generatePieceSet,
  canPlacePiece,
  placePiece,
  checkAndClearLines,
  calculateScore,
  canAnyPieceBePlaced,
  getPieceBounds,
  GRID_SIZE,
  BLOCK_COLORS,
  type Grid,
  type PieceShape,
  type BlockColorName,
} from "@/lib/game-logic";
import { GameBoard } from "./game-board";
import { PieceTray } from "./piece-tray";
import { ScoreHeader, CurrentScore } from "./score-header";
import { GameOverScreen } from "./game-over-screen";
import { StartScreen } from "./start-screen";
import { NewHighScoreBanner } from "./new-high-score-banner";

type GameState = "start" | "playing" | "gameover";

const LS_HIGH_SCORE_KEY = "block-puzzle-high-score";

function getHighScore(): number {
  if (typeof window === "undefined") return 0;
  const saved = localStorage.getItem(LS_HIGH_SCORE_KEY);
  return saved ? parseInt(saved, 10) : 0;
}

function saveHighScore(score: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_HIGH_SCORE_KEY, String(score));
}

// Smooth interpolation helper
function lerp(current: number, target: number, alpha: number): number {
  return current + (target - current) * alpha;
}

export function BlockPuzzleGame() {
  const [gameState, setGameState] = useState<GameState>("start");
  const [grid, setGrid] = useState<Grid>(createEmptyGrid);
  const [pieces, setPieces] = useState<(PieceShape | null)[]>([null, null, null]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [clearingRows, setClearingRows] = useState<number[]>([]);
  const [clearingCols, setClearingCols] = useState<number[]>([]);
  const [scoreAnimation, setScoreAnimation] = useState(false);
  const [showHighScoreBanner, setShowHighScoreBanner] = useState(false);

  // Drag state
  const [draggingPieceIndex, setDraggingPieceIndex] = useState<number | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [dragGridPos, setDragGridPos] = useState<{ row: number; col: number } | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [validPositions, setValidPositions] = useState<Set<string>>(new Set());
  const [snappedGridPos, setSnappedGridPos] = useState<{ row: number; col: number } | null>(null);
  const [visualDragPos, setVisualDragPos] = useState<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(38);

  // Load high score on mount
  useEffect(() => {
    setHighScore(getHighScore());
  }, []);

  // Calculate cell size -- use almost full screen width on mobile
  useEffect(() => {
    function handleResize() {
      // Use window width directly, not container (which may be constrained)
      const screenWidth = window.innerWidth;
      // Board takes almost all width: only 8px padding each side
      // LED wrapper adds 16px, board border adds 4px
      const availableForBoard = Math.min(screenWidth - 16, 500) - 20;
      // Each cell = cellSize, gaps between cells = 2px, total gaps = (GRID_SIZE+1)*2
      const totalGaps = (GRID_SIZE + 1) * 2;
      const size = Math.floor((availableForBoard - totalGaps) / GRID_SIZE);
      setCellSize(Math.max(size, 32));
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const startGame = useCallback(() => {
    setGrid(createEmptyGrid());
    setPieces(generatePieceSet());
    setScore(0);
    setIsNewHighScore(false);
    setShowHighScoreBanner(false);
    setDraggingPieceIndex(null);
    setDragPos(null);
    setDragGridPos(null);
    setClearingRows([]);
    setClearingCols([]);
    setGameState("playing");
  }, []);

  // --- Core place piece logic ---
  const doPlacePiece = useCallback(
    (pieceIndex: number, row: number, col: number) => {
      const piece = pieces[pieceIndex];
      if (!piece) return;
      if (!canPlacePiece(grid, piece, row, col)) return;

      const newGrid = placePiece(grid, piece, row, col);
      const result = checkAndClearLines(newGrid);
      const addedScore = calculateScore(piece.cells.length, result.totalCleared);

      if (result.totalCleared > 0) {
        setClearingRows(result.clearedRows);
        setClearingCols(result.clearedCols);
        setGrid(newGrid);
        setTimeout(() => {
          setGrid(result.newGrid);
          setClearingRows([]);
          setClearingCols([]);
        }, 550);
      } else {
        setGrid(newGrid);
      }

      const newScore = score + addedScore;
      setScore(newScore);
      setScoreAnimation(true);
      setTimeout(() => setScoreAnimation(false), 150);

      if (newScore > highScore) {
        setHighScore(newScore);
        saveHighScore(newScore);
        if (!isNewHighScore) {
          setIsNewHighScore(true);
          setShowHighScoreBanner(true);
          // Auto-hide banner after 0.8 seconds (0.5s display + 0.3s exit animation)
          setTimeout(() => {
            setShowHighScoreBanner(false);
          }, 800);
        }
      }

      const newPieces = [...pieces];
      newPieces[pieceIndex] = null;

      if (newPieces.every((p) => p === null)) {
        const newSet = generatePieceSet();
        setPieces(newSet);
        const finalGrid = result.totalCleared > 0 ? result.newGrid : newGrid;
        if (!canAnyPieceBePlaced(finalGrid, newSet)) {
          setTimeout(() => setGameState("gameover"), 400);
        }
      } else {
        setPieces(newPieces);
        const finalGrid = result.totalCleared > 0 ? result.newGrid : newGrid;
        if (!canAnyPieceBePlaced(finalGrid, newPieces)) {
          setTimeout(() => setGameState("gameover"), 400);
        }
      }
    },
    [pieces, grid, score, highScore]
  );

  // --- Convert pointer position to grid position ---
  const pointerToGridPos = useCallback(
    (clientX: number, clientY: number): { row: number; col: number } | null => {
      if (!boardRef.current) return null;
      const rect = boardRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const col = Math.floor((x - 2) / (cellSize + 2));
      const row = Math.floor((y - 2) / (cellSize + 2));
      if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
        return { row, col };
      }
      return null;
    },
    [cellSize]
  );

  // --- Pre-calculate valid placements for a piece ---
  const calculateValidPositions = useCallback(
    (piece: PieceShape): Set<string> => {
      const valid = new Set<string>();
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          if (canPlacePiece(grid, piece, row, col)) {
            valid.add(`${row}-${col}`);
          }
        }
      }
      return valid;
    },
    [grid]
  );

  // --- Drag start (from piece tray) ---
  const handleDragStart = useCallback(
    (index: number, clientX: number, clientY: number, offsetX: number, offsetY: number) => {
      if (pieces[index] === null) return;
      const piece = pieces[index]!;
      
      setDraggingPieceIndex(index);
      setDragPos({ x: clientX, y: clientY });
      setVisualDragPos({ x: clientX, y: clientY });
      setDragOffset({ x: offsetX, y: offsetY });
      setDragGridPos(null);
      setSnappedGridPos(null);
      
      // Pre-calculate valid positions
      const valid = calculateValidPositions(piece);
      setValidPositions(valid);
    },
    [pieces, calculateValidPositions]
  );

  // --- Convert pointer to grid position ---
  const calcGridFromPointer = useCallback(
    (clientX: number, clientY: number, piece: PieceShape | null) => {
      if (!boardRef.current || !piece) return null;
      const rect = boardRef.current.getBoundingClientRect();
      const cellStep = cellSize + 2;
      const bounds = getPieceBounds(piece);
      const pieceW = bounds.cols * cellStep;
      const pieceH = bounds.rows * cellStep;

      const floatTopLeftX = clientX - pieceW / 2;
      const floatTopLeftY = clientY - 60 - pieceH;
      const cellCenterX = floatTopLeftX + cellStep / 2;
      const cellCenterY = floatTopLeftY + cellStep / 2;

      const col = Math.round((cellCenterX - rect.left - 2 - cellSize / 2) / cellStep);
      const row = Math.round((cellCenterY - rect.top - 2 - cellSize / 2) / cellStep);

      if (row >= -1 && row < GRID_SIZE + 1 && col >= -1 && col < GRID_SIZE + 1) {
        return { row, col };
      }
      return null;
    },
    [cellSize]
  );

  // --- Magnetic snapping to nearest valid position ---
  const getSnappedPosition = useCallback(
    (pointerGrid: { row: number; col: number } | null): { row: number; col: number } | null => {
      if (!pointerGrid || validPositions.size === 0) return null;

      const SNAP_RADIUS = 2;
      let nearest: { row: number; col: number } | null = null;
      let minDist = Infinity;

      for (const key of validPositions) {
        const [row, col] = key.split("-").map(Number);
        const dist = Math.hypot(row - pointerGrid.row, col - pointerGrid.col);
        if (dist <= SNAP_RADIUS && dist < minDist) {
          minDist = dist;
          nearest = { row, col };
        }
      }
      return nearest;
    },
    [validPositions]
  );

  // --- Global pointer move / up for drag with snapping ---
  useEffect(() => {
    if (draggingPieceIndex === null) return;
    const piece = pieces[draggingPieceIndex];
    let lastVisualPos = dragPos;

    function handlePointerMove(e: PointerEvent) {
      e.preventDefault();
      const newPos = { x: e.clientX, y: e.clientY };
      setDragPos(newPos);

      // Calculate raw grid position
      const rawGrid = calcGridFromPointer(e.clientX, e.clientY, piece);
      
      // Apply magnetic snapping to nearest valid position
      const snapped = getSnappedPosition(rawGrid);
      setSnappedGridPos(snapped);
      
      // Use snapped position for grid display, raw for dragging
      setDragGridPos(snapped || rawGrid);

      // Smooth interpolation for visual position
      if (lastVisualPos) {
        const interpX = lerp(lastVisualPos.x, newPos.x, 0.2);
        const interpY = lerp(lastVisualPos.y, newPos.y, 0.2);
        setVisualDragPos({ x: interpX, y: interpY });
        lastVisualPos = { x: interpX, y: interpY };
      } else {
        setVisualDragPos(newPos);
        lastVisualPos = newPos;
      }
    }

    function handlePointerUp(e: PointerEvent) {
      if (draggingPieceIndex === null) return;

      // Use snapped position if available, otherwise raw grid position
      const finalGrid = snappedGridPos || calcGridFromPointer(e.clientX, e.clientY, piece);
      if (finalGrid && piece) {
        doPlacePiece(draggingPieceIndex, finalGrid.row, finalGrid.col);
      }

      setDraggingPieceIndex(null);
      setDragPos(null);
      setVisualDragPos(null);
      setDragGridPos(null);
      setSnappedGridPos(null);
      setValidPositions(new Set());
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: false });
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [draggingPieceIndex, pieces, cellSize, doPlacePiece, calcGridFromPointer, getSnappedPosition, snappedGridPos]);

  // --- Get dragged piece for ghost preview on board ---
  const draggedPiece = draggingPieceIndex !== null ? pieces[draggingPieceIndex] : null;

  if (gameState === "start") {
    return <StartScreen highScore={highScore} onPlay={startGame} />;
  }

  // Calculate floating piece position
  const previewCellSize = Math.floor(cellSize * 0.65);

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center min-h-screen w-full select-none"
      style={{ touchAction: "none" }}
    >
      {/* Score Header */}
      <ScoreHeader score={score} highScore={highScore} />

      {/* Current Score */}
      <CurrentScore score={score} scoreAnimation={scoreAnimation} />

      {/* New High Score Banner */}
      <NewHighScoreBanner 
        show={showHighScoreBanner} 
        onHidden={() => setShowHighScoreBanner(false)}
      />

      {/* Game Board */}
      <div ref={boardRef} className="relative">
        <GameBoard
          grid={grid}
          cellSize={cellSize}
          clearingRows={clearingRows}
          clearingCols={clearingCols}
          dragPiece={draggedPiece}
          dragGridPos={dragGridPos}
          onCellPointerUp={() => {}}
        />
      </div>

      {/* Piece Tray */}
      <PieceTray
        pieces={pieces}
        selectedPieceIndex={draggingPieceIndex}
        onDragStart={handleDragStart}
        cellSize={cellSize}
      />

      {/* Floating dragged piece with smooth position */}
      {draggingPieceIndex !== null && visualDragPos && draggedPiece && (
        <DragFloatingPiece
          piece={draggedPiece}
          pos={visualDragPos}
          cellSize={previewCellSize}
        />
      )}

      {/* Game Over */}
      {gameState === "gameover" && (
        <GameOverScreen
          score={score}
          highScore={highScore}
          isNewHighScore={isNewHighScore}
          onRestart={startGame}
          onHome={() => setGameState("start")}
        />
      )}
    </div>
  );
}

// Floating piece that follows pointer during drag
function DragFloatingPiece({
  piece,
  pos,
  cellSize,
}: {
  piece: PieceShape;
  pos: { x: number; y: number };
  cellSize: number;
}) {
  const bounds = getPieceBounds(piece);
  const w = bounds.cols * (cellSize + 1);
  const h = bounds.rows * (cellSize + 1);

  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{
        left: pos.x - w / 2,
        top: pos.y - h - 60,
        opacity: 0.85,
      }}
    >
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${bounds.cols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${bounds.rows}, ${cellSize}px)`,
          gap: "1px",
        }}
      >
        {Array.from({ length: bounds.rows }).map((_, r) =>
          Array.from({ length: bounds.cols }).map((_, c) => {
            const isFilled = piece.cells.some(
              ([pr, pc]) => pr === r && pc === c
            );
            if (!isFilled)
              return (
                <div
                  key={`${r}-${c}`}
                  style={{ width: cellSize, height: cellSize }}
                />
              );

            const col = BLOCK_COLORS[piece.color];
            return (
              <div
                key={`${r}-${c}`}
                className="rounded-[3px] relative overflow-hidden"
                style={{ width: cellSize, height: cellSize }}
              >
                <div
                  className="absolute inset-0 rounded-[3px]"
                  style={{ backgroundColor: col.base }}
                />
                <div
                  className="absolute inset-x-0 top-0 h-[35%] rounded-t-[3px]"
                  style={{
                    background: `linear-gradient(to bottom, ${col.light}, transparent)`,
                    opacity: 0.7,
                  }}
                />
                <div
                  className="absolute inset-x-0 bottom-0 h-[25%] rounded-b-[3px]"
                  style={{
                    background: `linear-gradient(to top, ${col.dark}, transparent)`,
                    opacity: 0.8,
                  }}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
