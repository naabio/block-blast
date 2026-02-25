"use client";

import React, { useCallback } from "react";
import type { PieceShape } from "@/lib/game-logic";
import { getPieceBounds } from "@/lib/game-logic";
import { BlockCell } from "./block-cell";

interface PieceTrayProps {
  pieces: (PieceShape | null)[];
  selectedPieceIndex: number | null;
  onDragStart: (index: number, clientX: number, clientY: number, offsetX: number, offsetY: number) => void;
  cellSize: number;
}

export function PieceTray({
  pieces,
  selectedPieceIndex,
  onDragStart,
  cellSize,
}: PieceTrayProps) {
  const previewCellSize = Math.floor(cellSize * 0.65);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, index: number) => {
      e.preventDefault();
      // Capture pointer for smooth dragging
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);

      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const offsetX = e.clientX - rect.left - rect.width / 2;
      const offsetY = e.clientY - rect.top - rect.height / 2;
      onDragStart(index, e.clientX, e.clientY, offsetX, offsetY);
    },
    [onDragStart]
  );

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
        const isDragging = selectedPieceIndex === i;

        return (
          <div
            key={i}
            className="flex items-center justify-center rounded-lg transition-all duration-150 cursor-grab active:cursor-grabbing"
            style={{
              width: previewCellSize * 5 + 16,
              height: previewCellSize * 5 + 16,
              opacity: isDragging ? 0.3 : 1,
              transform: isDragging ? "scale(0.9)" : "scale(1)",
              background: "transparent",
              border: "2px solid transparent",
            }}
            onPointerDown={(e) => handlePointerDown(e, i)}
          >
            <div
              className="grid pointer-events-none"
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
          </div>
        );
      })}
    </div>
  );
}
