"use client";

import { BLOCK_COLORS, type BlockColorName } from "@/lib/game-logic";

interface BlockCellProps {
  color: BlockColorName | null;
  size: number;
  isPreview?: boolean;
  isClearing?: boolean;
  ghost?: boolean;
}

export function BlockCell({
  color,
  size,
  isPreview = false,
  isClearing = false,
  ghost = false,
}: BlockCellProps) {
  if (!color) {
    return (
      <div
        style={{ width: size, height: size }}
        className="rounded-[2px] bg-[hsl(225,40%,18%)] border border-[hsl(225,30%,22%)]"
      />
    );
  }

  const c = BLOCK_COLORS[color];

  return (
    <div
      style={{
        width: size,
        height: size,
        animation: isClearing ? "cellPop 0.5s ease-out forwards" : "none",
      }}
      className="rounded-[3px] relative overflow-hidden"
    >
      {/* Base color */}
      <div
        className="absolute inset-0 rounded-[3px]"
        style={{
          backgroundColor: c.base,
          opacity: ghost ? 0.45 : 1,
        }}
      />
      {/* 3D top highlight */}
      <div
        className="absolute inset-x-0 top-0 h-[35%] rounded-t-[3px]"
        style={{
          background: `linear-gradient(to bottom, ${c.light}, transparent)`,
          opacity: ghost ? 0.3 : 0.7,
        }}
      />
      {/* 3D left highlight */}
      <div
        className="absolute inset-y-0 left-0 w-[30%] rounded-l-[3px]"
        style={{
          background: `linear-gradient(to right, ${c.light}, transparent)`,
          opacity: ghost ? 0.15 : 0.3,
        }}
      />
      {/* 3D bottom shadow */}
      <div
        className="absolute inset-x-0 bottom-0 h-[25%] rounded-b-[3px]"
        style={{
          background: `linear-gradient(to top, ${c.dark}, transparent)`,
          opacity: ghost ? 0.3 : 0.8,
        }}
      />
      {/* 3D right shadow */}
      <div
        className="absolute inset-y-0 right-0 w-[25%] rounded-r-[3px]"
        style={{
          background: `linear-gradient(to left, ${c.dark}, transparent)`,
          opacity: ghost ? 0.2 : 0.5,
        }}
      />
      {/* Center shine */}
      <div
        className="absolute top-[15%] left-[15%] w-[30%] h-[25%] rounded-sm"
        style={{
          background: `radial-gradient(ellipse, ${c.glow}40, transparent)`,
        }}
      />
      
      {/* Decorative diamond pattern at center */}
      {!ghost && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Diamond shape */}
          <div
            style={{
              width: size * 0.35,
              height: size * 0.35,
              background: `linear-gradient(135deg, ${c.light}60, ${c.glow}40)`,
              transform: "rotate(45deg)",
              borderRadius: "2px",
              opacity: 0.4,
              boxShadow: `inset 0 0 4px ${c.light}80, 0 0 6px ${c.glow}40`,
            }}
          />
        </div>
      )}
      
      {/* Corner star accents */}
      {!ghost && (
        <>
          {/* Top-right corner star */}
          <div
            className="absolute pointer-events-none"
            style={{
              right: size * 0.1,
              top: size * 0.1,
              width: size * 0.15,
              height: size * 0.15,
              background: `radial-gradient(circle, ${c.glow}80, ${c.light}40, transparent)`,
              borderRadius: "50%",
              opacity: 0.5,
              boxShadow: `0 0 3px ${c.glow}`,
            }}
          />
          {/* Bottom-left corner star */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: size * 0.08,
              bottom: size * 0.12,
              width: size * 0.12,
              height: size * 0.12,
              background: `radial-gradient(circle, ${c.glow}60, transparent)`,
              borderRadius: "50%",
              opacity: 0.4,
              boxShadow: `0 0 2px ${c.glow}`,
            }}
          />
        </>
      )}
      
      {/* Clearing glow overlay */}
      {isClearing && (
        <div
          className="absolute inset-0 rounded-[3px]"
          style={{
            background: `radial-gradient(circle, ${c.glow}, ${c.light}80, transparent)`,
            boxShadow: `0 0 12px ${c.glow}, 0 0 24px ${c.glow}80`,
            animation: "cellPop 0.5s ease-out forwards",
          }}
        />
      )}
    </div>
  );
}
