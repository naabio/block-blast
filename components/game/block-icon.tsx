export type BlockIconType = "star" | "pentagon" | "none";

interface BlockIconProps {
  type: BlockIconType;
  color: string;
  size: number;
}

export function BlockIcon({ type, color, size }: BlockIconProps) {
  if (type === "none") return null;

  const iconSize = Math.floor(size * 0.48);

  if (type === "star") {
    return (
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill={color}
        className="pointer-events-none"
        style={{
          filter: `drop-shadow(0 3px 6px rgba(0,0,0,0.5))`,
        }}
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    );
  }

  if (type === "pentagon") {
    return (
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill={color}
        className="pointer-events-none"
        style={{
          filter: `drop-shadow(0 3px 6px rgba(0,0,0,0.5))`,
        }}
      >
        <path d="M12 2l3.82 7.45h8.23l-6.65 4.84 2.54 7.84-6.94-5.05-6.94 5.05 2.54-7.84-6.65-4.84h8.23z" />
      </svg>
    );
  }

  return null;
}
