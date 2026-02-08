"use client";

import React from "react"

import { useState, useCallback, useEffect, useRef } from "react";
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
  const [selectedPieceIndex, setSelectedPieceIndex] = useState<number | null>(null);
  const [clearingRows, setClearingRows] = useState<number[]>([]);
  const [clearingCols, setClearingCols] = useState<number[]>([]);
  const [scoreAnimation, setScoreAnimation] = useState(false);

  // For drag-and-drop on board
  const [dragPiece, setDragPiece] = useState<PieceShape | null>(null);
  const [dragGridPos, setDragGridPos] = useState<{ row: number; col: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
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
    setSelectedPieceIndex(null);
    setClearingRows([]);
    setClearingCols([]);
    setGameState("playing");
  }, []);

  const handleSelectPiece = useCallback(
    (index: number) => {
      if (pieces[index] === null) return;
      setSelectedPieceIndex((prev) => (prev === index ? null : index));
      setDragPiece(pieces[index]);
      setDragGridPos(null);
    },
    [pieces]
  );

  const handlePlacePiece = useCallback(
    (row: number, col: number) => {
      if (selectedPieceIndex === null) return;
      const piece = pieces[selectedPieceIndex];
      if (!piece) return;

      if (!canPlacePiece(grid, piece, row, col)) return;

      // Place the piece
      let newGrid = placePiece(grid, piece, row, col);

      // Check for cleared lines
      const result = checkAndClearLines(newGrid);

      // Calculate score
      const addedScore = calculateScore(piece.cells.length, result.totalCleared);

      // If lines cleared, show animation
      if (result.totalCleared > 0) {
        setClearingRows(result.clearedRows);
        setClearingCols(result.clearedCols);

        // Temporarily set the grid before clearing for animation
        setGrid(newGrid);

        setTimeout(() => {
          setGrid(result.newGrid);
          setClearingRows([]);
          setClearingCols([]);
        }, 300);
      } else {
        setGrid(newGrid);
      }

      // Update score
      const newScore = score + addedScore;
      setScore(newScore);
      setScoreAnimation(true);
      setTimeout(() => setScoreAnimation(false), 150);

      // Update high score
      if (newScore > highScore) {
        setHighScore(newScore);
        saveHighScore(newScore);
        setIsNewHighScore(true);
      }

      // Remove used piece
      const newPieces = [...pieces];
      newPieces[selectedPieceIndex] = null;

      // Check if all pieces used, generate new set
      if (newPieces.every((p) => p === null)) {
        const newSet = generatePieceSet();
        setPieces(newSet);

        // Check game over with new pieces on the post-clear grid
        const finalGrid = result.totalCleared > 0 ? result.newGrid : newGrid;
        if (!canAnyPieceBePlaced(finalGrid, newSet)) {
          setTimeout(() => setGameState("gameover"), 400);
        }
      } else {
        setPieces(newPieces);

        // Check game over with remaining pieces
        const finalGrid = result.totalCleared > 0 ? result.newGrid : newGrid;
        if (!canAnyPieceBePlaced(finalGrid, newPieces)) {
          setTimeout(() => setGameState("gameover"), 400);
        }
      }

      setSelectedPieceIndex(null);
      setDragPiece(null);
      setDragGridPos(null);
    },
    [selectedPieceIndex, pieces, grid, score, highScore]
  );

  // Handle pointer move on the board to show ghost preview
  const handleBoardPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (selectedPieceIndex === null || !pieces[selectedPieceIndex]) return;

      const board = e.currentTarget;
      const rect = board.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const col = Math.floor((x - 2) / (cellSize + 2));
      const row = Math.floor((y - 2) / (cellSize + 2));

      if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
        setDragGridPos({ row, col });
      }
    },
    [selectedPieceIndex, pieces, cellSize]
  );

  const handleCellPointerUp = useCallback(
    (row: number, col: number) => {
      if (selectedPieceIndex !== null) {
        handlePlacePiece(row, col);
      }
    },
    [selectedPieceIndex, handlePlacePiece]
  );

  if (gameState === "start") {
    return <StartScreen highScore={highScore} onPlay={startGame} />;
  }

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
      <div
        className="relative"
        onPointerMove={handleBoardPointerMove}
        onPointerLeave={() => setDragGridPos(null)}
      >
        <GameBoard
          grid={grid}
          cellSize={cellSize}
          clearingRows={clearingRows}
          clearingCols={clearingCols}
          dragPiece={selectedPieceIndex !== null ? pieces[selectedPieceIndex] : null}
          dragGridPos={dragGridPos}
          onCellPointerUp={handleCellPointerUp}
        />
      </div>

      {/* Piece Tray */}
      <PieceTray
        pieces={pieces}
        selectedPieceIndex={selectedPieceIndex}
        onSelectPiece={handleSelectPiece}
        cellSize={cellSize}
      />

      {/* Instructions */}
      {selectedPieceIndex !== null && (
        <p className="text-[hsl(220,30%,60%)] text-xs text-center mt-1 animate-pulse">
          Tap on the board to place the block
        </p>
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
