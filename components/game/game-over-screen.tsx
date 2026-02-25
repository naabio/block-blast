"use client";

import { Crown, RotateCcw, Home } from "lucide-react";

interface GameOverScreenProps {
  score: number;
  highScore: number;
  isNewHighScore: boolean;
  onRestart: () => void;
  onHome: () => void;
}

export function GameOverScreen({
  score,
  highScore,
  isNewHighScore,
  onRestart,
  onHome,
}: GameOverScreenProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="flex flex-col items-center gap-6 px-8 py-10 rounded-2xl mx-4 max-w-sm w-full"
        style={{
          background: "linear-gradient(180deg, hsl(225,40%,20%), hsl(225,40%,14%))",
          boxShadow: "0 8px 40px rgba(0,0,0,0.5), 0 0 30px rgba(59,130,246,0.1)",
          border: "1px solid hsl(225,35%,30%)",
        }}
      >
        {/* No Space Left */}
        <h2
          className="text-white font-bold text-2xl text-center"
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
        >
          No Space Left
        </h2>

        {/* New High Score Badge */}
        {isNewHighScore && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/40">
            <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span className="text-amber-400 font-bold text-sm">
              NEW HIGH SCORE
            </span>
          </div>
        )}

        {/* Score Display */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[hsl(220,30%,60%)] text-sm font-medium uppercase tracking-wide">
            Score
          </span>
          <span
            className="text-white font-bold tabular-nums"
            style={{
              fontSize: "3rem",
              textShadow: "0 0 20px rgba(59,130,246,0.3)",
            }}
          >
            {score}
          </span>
        </div>

        {/* Best Score */}
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span className="text-[hsl(220,30%,60%)] text-sm">
            Best: <span className="text-amber-400 font-semibold tabular-nums">{highScore}</span>
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-4 mt-2 w-full">
          <button
            type="button"
            onClick={onHome}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105 active:scale-95 bg-transparent"
            style={{
              background: "hsl(225,35%,25%)",
              border: "1px solid hsl(225,35%,35%)",
            }}
          >
            <Home className="w-5 h-5" />
            Home
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105 active:scale-95 bg-transparent"
            style={{
              background: "linear-gradient(135deg, #3b82f6, #2563eb)",
              boxShadow: "0 4px 15px rgba(59,130,246,0.3)",
            }}
          >
            <RotateCcw className="w-5 h-5" />
            Restart
          </button>
        </div>
      </div>
    </div>
  );
}
