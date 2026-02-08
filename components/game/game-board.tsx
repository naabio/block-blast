"use client";

import { type Grid, GRID_SIZE, type PieceShape, canPlacePiece } from "@/lib/game-logic";
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

  // Calculate ghost preview cells
  const ghostCells = new Map<string, string>();
  if (dragPiece && dragGridPos && canPlacePiece(grid, dragPiece, dragGridPos.row, dragGridPos.col)) {
    for (const [r, c] of dragPiece.cells) {
      const gr = dragGridPos.row + r;
      const gc = dragGridPos.col + c;
      ghostCells.set(`${gr}-${gc}`, dragPiece.color);
    }
  }

  return (
    <div
      className="relative rounded-lg overflow-hidden"
      style={{
        width: boardSize,
        height: boardSize,
        background: "hsl(225, 40%, 14%)",
        boxShadow: "inset 0 2px 8px rgba(0,0,0,0.5), 0 0 20px rgba(59,130,246,0.15)",
        border: "2px solid hsl(225, 35%, 25%)",
      }}
    >
      {/* LED border glow */}
      <div
        className="absolute -inset-[3px] rounded-lg pointer-events-none"
        style={{
          border: "3px solid transparent",
          borderImage: "linear-gradient(135deg, #22c55e, #3b82f6, #22c55e, #3b82f6) 1",
          opacity: 0.4,
        }}
      />

      {/* Grid */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, ${cellSize}px)`,
          gap: "2px",
          padding: "2px",
        }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const key = `${r}-${c}`;
            const isClearing = clearingRows.includes(r) || clearingCols.includes(c);
            const ghostColor = ghostCells.get(key);

            return (
              <div
                key={key}
                onPointerUp={() => onCellPointerUp(r, c)}
              >
                {ghostColor && !cell ? (
                  <BlockCell
                    color={ghostColor as any}
                    size={cellSize}
                    ghost
                  />
                ) : (
                  <BlockCell
                    color={cell}
                    size={cellSize}
                    isClearing={isClearing}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
