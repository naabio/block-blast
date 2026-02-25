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
      className="relative rounded-lg flex items-center justify-center"
      style={{
        width: boardSize + 16,
        height: boardSize + 16,
      }}
    >
      {/* Board inner */}
      <div
        className="relative rounded-lg"
        style={{
          width: boardSize,
          height: boardSize,
          background: "hsl(225, 40%, 14%)",
          boxShadow: isClearing
            ? "inset 0 2px 8px rgba(0,0,0,0.5), 0 0 30px rgba(34,197,94,0.4), 0 0 60px rgba(34,197,94,0.15)"
            : "inset 0 2px 8px rgba(0,0,0,0.5), 0 0 20px rgba(59,130,246,0.15)",
          border: `2px solid ${isClearing ? "rgba(34,197,94,0.5)" : "hsl(225, 35%, 25%)"}`,
          transition: "box-shadow 0.3s, border-color 0.3s",
          overflow: "visible",
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
          className="grid absolute"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, ${cellSize}px)`,
            gap: "2px",
            padding: "2px",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 0,
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
