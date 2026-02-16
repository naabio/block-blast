"use client";

import { useEffect, useState, useRef } from "react";
import { Crown } from "lucide-react";

interface NewHighScoreBannerProps {
  show: boolean;
  onHidden?: () => void;
}

export function NewHighScoreBanner({ show, onHidden }: NewHighScoreBannerProps) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const prevShow = useRef(false);

  useEffect(() => {
    // Only trigger on rising edge: show goes from false to true
    if (show && !prevShow.current) {
      setVisible(true);
      setExiting(false);

      // Start exit after 1 second
      const exitTimer = setTimeout(() => {
        setExiting(true);
      }, 1000);

      // Fully hide after exit animation (0.4s)
      const hideTimer = setTimeout(() => {
        setVisible(false);
        onHidden?.();
      }, 1400);

      prevShow.current = true;
      return () => {
        clearTimeout(exitTimer);
        clearTimeout(hideTimer);
      };
    }

    if (!show) {
      prevShow.current = false;
    }
  }, [show, onHidden]);

  if (!visible) return null;

  return (
    <div className="absolute inset-x-0 top-1/3 z-30 flex justify-center pointer-events-none">
      <div
        className="flex flex-col items-center gap-2 px-6 py-4 rounded-2xl"
        style={{
          background: "linear-gradient(135deg, rgba(180,120,20,0.95), rgba(220,170,40,0.9), rgba(180,120,20,0.95))",
          boxShadow: "0 0 40px rgba(250,200,50,0.5), 0 0 80px rgba(250,200,50,0.2), inset 0 1px 0 rgba(255,255,255,0.3)",
          border: "2px solid rgba(255,220,80,0.6)",
          animation: exiting
            ? "highScoreBounce 0.4s ease-in reverse forwards"
            : "highScoreBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        }}
      >
        {/* Crown */}
        <Crown
          className="w-10 h-10 text-yellow-200 fill-yellow-200 drop-shadow-lg"
          style={{ animation: "crownBounce 1s ease-in-out infinite", animationDelay: "0.5s" }}
        />

        {/* Text */}
        <span
          className="font-black text-xl tracking-wide text-transparent bg-clip-text"
          style={{
            backgroundImage: "linear-gradient(90deg, #fff9c4, #ffffff, #fff9c4, #ffffff, #fff9c4)",
            backgroundSize: "200% auto",
            animation: "shimmer 2s linear infinite",
            textShadow: "0 0 10px rgba(255,255,200,0.5)",
            WebkitBackgroundClip: "text",
          }}
        >
          NEW HIGH SCORE
        </span>

        {/* Sparkle particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 pointer-events-none"
            style={{
              left: `${15 + i * 15}%`,
              top: `${10 + (i % 3) * 30}%`,
              animation: `sparkle ${0.8 + i * 0.2}s ease-in-out infinite`,
              animationDelay: `${i * 0.15}s`,
            }}
          >
            <svg viewBox="0 0 24 24" className="w-full h-full text-yellow-200 fill-yellow-200">
              <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}
