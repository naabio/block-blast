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
  GRID_SIZE,
  type Grid,
  type PieceShape,
} from "@/lib/game-logic";
import { GameBoard } from "./game-board";
import { PieceTray } from "./piece-tray";
import { ScoreHeader, CurrentScore } from "./score-header";
import { GameOverScreen } from "./game-over-screen";
import { StartScreen } from "./start-screen";

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

  // Drag state
  const [draggingPieceIndex, setDraggingPieceIndex] = useState<number | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [dragGridPos, setDragGridPos] = useState<{ row: number; col: number } | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(38);

  // Load high score on mount
  useEffect(() => {
    setHighScore(getHighScore());
  }, []);

  // Calculate cell size based on container width
  useEffect(() => {
    function handleResize() {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const maxBoardWidth = Math.min(width - 32, 400);
        const size = Math.floor((maxBoardWidth - (GRID_SIZE + 1) * 2) / GRID_SIZE);
        setCellSize(Math.max(size, 28));
      }
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
        }, 300);
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
        setIsNewHighScore(true);
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

  // --- Drag start (from piece tray) ---
  const handleDragStart = useCallback(
    (index: number, clientX: number, clientY: number, offsetX: number, offsetY: number) => {
      if (pieces[index] === null) return;
      setDraggingPieceIndex(index);
      setDragPos({ x: clientX, y: clientY });
      setDragOffset({ x: offsetX, y: offsetY });
      setDragGridPos(null);
    },
    [pieces]
  );

  // --- Global pointer move / up for drag ---
  useEffect(() => {
    if (draggingPieceIndex === null) return;

    function handlePointerMove(e: PointerEvent) {
      e.preventDefault();
      setDragPos({ x: e.clientX, y: e.clientY });

      // Check if over the board
      if (boardRef.current) {
        const rect = boardRef.current.getBoundingClientRect();
        // Use a position above the finger for mobile so user can see the piece
        const touchOffsetY = 80;
        const x = e.clientX - rect.left;
        const y = e.clientY - touchOffsetY - rect.top;
        const col = Math.floor((x - 2) / (cellSize + 2));
        const row = Math.floor((y - 2) / (cellSize + 2));
        if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
          setDragGridPos({ row, col });
        } else {
          setDragGridPos(null);
        }
      }
    }

    function handlePointerUp(e: PointerEvent) {
      if (draggingPieceIndex === null) return;

      // Try to place piece
      if (boardRef.current) {
        const rect = boardRef.current.getBoundingClientRect();
        const touchOffsetY = 80;
        const x = e.clientX - rect.left;
        const y = e.clientY - touchOffsetY - rect.top;
        const col = Math.floor((x - 2) / (cellSize + 2));
        const row = Math.floor((y - 2) / (cellSize + 2));

        if (
          row >= 0 &&
          row < GRID_SIZE &&
          col >= 0 &&
          col < GRID_SIZE
        ) {
          doPlacePiece(draggingPieceIndex, row, col);
        }
      }

      setDraggingPieceIndex(null);
      setDragPos(null);
      setDragGridPos(null);
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: false });
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [draggingPieceIndex, cellSize, doPlacePiece]);

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
      className="flex flex-col items-center min-h-screen max-w-md mx-auto select-none"
      style={{ touchAction: "none" }}
    >
      {/* Score Header */}
      <ScoreHeader score={score} highScore={highScore} />

      {/* Current Score */}
      <CurrentScore score={score} scoreAnimation={scoreAnimation} />

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

      {/* Floating dragged piece */}
      {draggingPieceIndex !== null && dragPos && draggedPiece && (
        <DragFloatingPiece
          piece={draggedPiece}
          pos={dragPos}
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
import { BLOCK_COLORS, getPieceBounds, type BlockColorName } from "@/lib/game-logic";

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
