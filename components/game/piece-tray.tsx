"use client";

import type { PieceShape } from "@/lib/game-logic";
import { getPieceBounds } from "@/lib/game-logic";
import { BlockCell } from "./block-cell";

interface PieceTrayProps {
  pieces: (PieceShape | null)[];
  selectedPieceIndex: number | null;
  onSelectPiece: (index: number) => void;
  cellSize: number;
}

export function PieceTray({
  pieces,
  selectedPieceIndex,
  onSelectPiece,
  cellSize,
}: PieceTrayProps) {
  const previewCellSize = Math.floor(cellSize * 0.65);

  return (
    <div className="flex items-center justify-around w-full px-2 py-4">
      {pieces.map((piece, i) => {
        if (!piece) {
          return (
            <div
              key={i}
              className="flex items-center justify-center"
              style={{
                width: previewCellSize * 5 + 16,
                height: previewCellSize * 5 + 16,
              }}
            />
          );
        }

        const bounds = getPieceBounds(piece);
        const isSelected = selectedPieceIndex === i;

        return (
          <button
            type="button"
            key={i}
            className="flex items-center justify-center rounded-lg transition-all duration-150"
            style={{
              width: previewCellSize * 5 + 16,
              height: previewCellSize * 5 + 16,
              transform: isSelected ? "scale(1.15)" : "scale(1)",
              background: isSelected ? "rgba(59,130,246,0.15)" : "transparent",
              border: isSelected ? "2px solid rgba(59,130,246,0.4)" : "2px solid transparent",
            }}
            onClick={() => onSelectPiece(i)}
          >
            <div
              className="grid"
              style={{
                gridTemplateColumns: `repeat(${bounds.cols}, ${previewCellSize}px)`,
                gridTemplateRows: `repeat(${bounds.rows}, ${previewCellSize}px)`,
                gap: "1px",
              }}
            >
              {Array.from({ length: bounds.rows }).map((_, r) =>
                Array.from({ length: bounds.cols }).map((_, c) => {
                  const isFilled = piece.cells.some(
                    ([pr, pc]) => pr === r && pc === c
                  );
                  return (
                    <div key={`${r}-${c}`}>
                      {isFilled ? (
                        <BlockCell
                          color={piece.color}
                          size={previewCellSize}
                          isPreview
                        />
                      ) : (
                        <div
                          style={{
                            width: previewCellSize,
                            height: previewCellSize,
                          }}
                        />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
