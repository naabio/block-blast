"use client";

import { useMemo } from "react";
import { type Grid, GRID_SIZE, type PieceShape, canPlacePiece, type BlockColorName } from "@/lib/game-logic";
import { BlockCell } from "./block-cell";

interface GameBoardProps {
  grid: Grid;
  cellSize: number;
  clearingRows: number[];
  clearingCols: number[];
  dragPiece: PieceShape | null;
  dragGridPos: { row: number; col: number } | null;
  onCellPointerUp: (row: number, col: number) => void;
}

// LED dot positions around the board border
function useLedDots(boardSize: number, count: number) {
  return useMemo(() => {
    const dots: { x: number; y: number; delay: number }[] = [];
    const perimeter = boardSize * 4;
    const spacing = perimeter / count;
    for (let i = 0; i < count; i++) {
      const d = i * spacing;
      let x = 0;
      let y = 0;
      if (d < boardSize) {
        x = d; y = 0; // top
      } else if (d < boardSize * 2) {
        x = boardSize; y = d - boardSize; // right
      } else if (d < boardSize * 3) {
        x = boardSize - (d - boardSize * 2); y = boardSize; // bottom
      } else {
        x = 0; y = boardSize - (d - boardSize * 3); // left
      }
      dots.push({ x, y, delay: i * 0.06 });
    }
    return dots;
  }, [boardSize, count]);
}

export function GameBoard({
  grid,
  cellSize,
  clearingRows,
  clearingCols,
  dragPiece,
  dragGridPos,
  onCellPointerUp,
}: GameBoardProps) {
  const boardSize = GRID_SIZE * cellSize + (GRID_SIZE + 1) * 2;
  const isClearing = clearingRows.length > 0 || clearingCols.length > 0;
  const ledDots = useLedDots(boardSize, 40);

  // Calculate ghost preview cells -- only show when placement is valid
  const ghostCells = new Map<string, string>();
  const canPlace = dragPiece && dragGridPos ? canPlacePiece(grid, dragPiece, dragGridPos.row, dragGridPos.col) : false;

  if (dragPiece && dragGridPos && canPlace) {
    for (const [r, c] of dragPiece.cells) {
      const gr = dragGridPos.row + r;
      const gc = dragGridPos.col + c;
      if (gr >= 0 && gr < GRID_SIZE && gc >= 0 && gc < GRID_SIZE) {
        ghostCells.set(`${gr}-${gc}`, dragPiece.color);
      }
    }
  }

  return (
    <div
      className="relative rounded-lg"
      style={{
        width: boardSize + 16,
        height: boardSize + 16,
        padding: 8,
      }}
    >
      {/* LED dots around border */}
      {ledDots.map((dot, i) => {
        const baseStyle: React.CSSProperties = {
          left: dot.x + 8 - 2.5,
          top: dot.y + 8 - 2.5,
        };
        
        if (isClearing) {
          baseStyle["--dot-delay" as any] = `${dot.delay}s`;
        }
        
        return (
          <div
            key={i}
            className={`led-dot ${isClearing ? "led-dot--active" : "led-dot--inactive"}`}
            style={baseStyle}
          />
        );
      })}

      {/* Board inner */}
      <div
        className="relative rounded-lg overflow-hidden"
        style={{
          width: boardSize,
          height: boardSize,
          background: "hsl(225, 40%, 14%)",
          boxShadow: isClearing
            ? "inset 0 2px 8px rgba(0,0,0,0.5), 0 0 30px rgba(34,197,94,0.4), 0 0 60px rgba(34,197,94,0.15)"
            : "inset 0 2px 8px rgba(0,0,0,0.5), 0 0 20px rgba(59,130,246,0.15)",
          border: `2px solid ${isClearing ? "rgba(34,197,94,0.5)" : "hsl(225, 35%, 25%)"}`,
          transition: "box-shadow 0.3s, border-color 0.3s",
        }}
      >
        {/* Line clear glow bars -- horizontal */}
        {clearingRows.map((row) => (
          <div
            key={`row-glow-${row}`}
            className="absolute left-0 right-0 pointer-events-none z-10"
            style={{
              top: 2 + row * (cellSize + 2),
              height: cellSize,
              background: "linear-gradient(90deg, transparent, rgba(34,197,94,0.6), rgba(150,255,150,0.9), rgba(34,197,94,0.6), transparent)",
              boxShadow: "0 0 20px rgba(34,197,94,0.8), 0 0 40px rgba(34,197,94,0.4)",
              animation: "lineClearGlow 0.5s ease-out forwards",
              transformOrigin: "center",
            }}
          />
        ))}

        {/* Line clear glow bars -- vertical */}
        {clearingCols.map((col) => (
          <div
            key={`col-glow-${col}`}
            className="absolute top-0 bottom-0 pointer-events-none z-10"
            style={{
              left: 2 + col * (cellSize + 2),
              width: cellSize,
              background: "linear-gradient(180deg, transparent, rgba(34,197,94,0.6), rgba(150,255,150,0.9), rgba(34,197,94,0.6), transparent)",
              boxShadow: "0 0 20px rgba(34,197,94,0.8), 0 0 40px rgba(34,197,94,0.4)",
              animation: "lineClearGlowY 0.5s ease-out forwards",
              transformOrigin: "center",
            }}
          />
        ))}

        {/* Grid */}
        <div
          className="grid relative z-0"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, ${cellSize}px)`,
            gap: "2px",
            padding: "2px",
          }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const key = `${r}-${c}`;
              const isCellClearing = clearingRows.includes(r) || clearingCols.includes(c);
              const ghostColor = ghostCells.get(key);

              return (
                <div
                  key={key}
                  onPointerUp={() => onCellPointerUp(r, c)}
                >
                  {ghostColor && !cell ? (
                    <BlockCell
                      color={ghostColor as BlockColorName}
                      size={cellSize}
                      ghost
                    />
                  ) : (
                    <BlockCell
                      color={cell}
                      size={cellSize}
                      isClearing={isCellClearing}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
