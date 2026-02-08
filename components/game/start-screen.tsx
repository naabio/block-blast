"use client";

import { Crown, Play } from "lucide-react";

interface StartScreenProps {
  highScore: number;
  onPlay: () => void;
}

export function StartScreen({ highScore, onPlay }: StartScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 gap-8">
      {/* Title */}
      <div className="flex flex-col items-center gap-4">
        {/* Game icon - block arrangement */}
        <div className="grid grid-cols-3 gap-1">
          {[
            "#dc2626", "#06b6d4", "#eab308",
            "#16a34a", "#ea580c", "#2563eb",
            "#9333ea", "#dc2626", "#06b6d4",
          ].map((color, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-[3px]"
              style={{
                background: `linear-gradient(135deg, ${color}cc, ${color})`,
                boxShadow: `inset 0 1px 2px rgba(255,255,255,0.3), inset 0 -1px 2px rgba(0,0,0,0.3)`,
              }}
            />
          ))}
        </div>

        <h1
          className="text-white font-bold text-balance text-center"
          style={{
            fontSize: "clamp(2rem, 10vw, 3.5rem)",
            textShadow: "0 2px 10px rgba(0,0,0,0.3)",
          }}
        >
          Block Puzzle
        </h1>

        <p className="text-[hsl(220,30%,70%)] text-center text-sm max-w-xs leading-relaxed">
          Drag blocks to fill rows and columns. Clear lines to score points!
        </p>
      </div>

      {/* High Score */}
      {highScore > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(225,40%,20%)] border border-[hsl(225,35%,30%)]">
          <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />
          <span className="text-amber-400 font-semibold tabular-nums">
            Best: {highScore}
          </span>
        </div>
      )}

      {/* Play Button */}
      <button
        type="button"
        onClick={onPlay}
        className="flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-lg text-white transition-all duration-200 hover:scale-105 active:scale-95 bg-transparent"
        style={{
          background: "linear-gradient(135deg, #3b82f6, #2563eb)",
          boxShadow: "0 4px 20px rgba(59,130,246,0.4), 0 2px 8px rgba(0,0,0,0.2)",
        }}
      >
        <Play className="w-6 h-6 fill-white" />
        Play
      </button>
    </div>
  );
}
