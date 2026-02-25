"use client";

import { Crown, Settings } from "lucide-react";

interface ScoreHeaderProps {
  score: number;
  highScore: number;
  onSettings?: () => void;
}

export function ScoreHeader({ score, highScore, onSettings }: ScoreHeaderProps) {
  return (
    <div className="flex items-center justify-between w-full px-4 pt-1 pb-0">
      {/* High Score */}
      <div className="flex items-center gap-1.5">
        <Crown className="w-6 h-6 text-amber-400 fill-amber-400" />
        <span className="text-amber-400 font-bold text-lg tabular-nums">
          {highScore}
        </span>
      </div>

      {/* Settings */}
      <button
        type="button"
        onClick={onSettings}
        className="p-2 rounded-full text-[hsl(220,30%,70%)] hover:text-white transition-colors bg-transparent"
        aria-label="Settings"
      >
        <Settings className="w-6 h-6" />
      </button>
    </div>
  );
}

interface CurrentScoreProps {
  score: number;
  scoreAnimation: boolean;
}

export function CurrentScore({ score, scoreAnimation }: CurrentScoreProps) {
  return (
    <div className="flex flex-col items-center py-1">
      {/* Diamond icon */}
      <div
        className="w-5 h-5 rotate-45 mb-1"
        style={{
          background: "linear-gradient(135deg, #60a5fa, #3b82f6)",
          boxShadow: "0 0 10px rgba(59,130,246,0.5)",
        }}
      />
      {/* Score number */}
      <span
        className={`text-white font-bold tabular-nums ${scoreAnimation ? "animate-score-pop" : ""}`}
        style={{
          fontSize: "clamp(2rem, 8vw, 3.5rem)",
          textShadow: "0 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        {score}
      </span>
    </div>
  );
}
