// ===========================================
// Block Puzzle Game - Core Logic
// ===========================================

export const GRID_SIZE = 8;

// All block colors with 3D-style gradient info
export const BLOCK_COLORS = {
  red: { base: "#dc2626", light: "#ef4444", dark: "#991b1b", glow: "#fca5a5" },
  cyan: { base: "#06b6d4", light: "#22d3ee", dark: "#0e7490", glow: "#a5f3fc" },
  gold: { base: "#eab308", light: "#facc15", dark: "#a16207", glow: "#fef08a" },
  green: { base: "#16a34a", light: "#4ade80", dark: "#15803d", glow: "#bbf7d0" },
  orange: { base: "#ea580c", light: "#fb923c", dark: "#c2410c", glow: "#fed7aa" },
  blue: { base: "#2563eb", light: "#3b82f6", dark: "#1d4ed8", glow: "#93c5fd" },
  purple: { base: "#9333ea", light: "#a855f7", dark: "#7e22ce", glow: "#d8b4fe" },
} as const;

export type BlockColorName = keyof typeof BLOCK_COLORS;

const COLOR_NAMES: BlockColorName[] = Object.keys(BLOCK_COLORS) as BlockColorName[];

// Block piece shapes as relative coordinates [row, col]
export interface PieceShape {
  cells: [number, number][];
  color: BlockColorName;
}

// All available piece templates (before color assignment)
const PIECE_TEMPLATES: [number, number][][] = [
  // Single
  [[0, 0]],
  // Horizontal 2
  [[0, 0], [0, 1]],
  // Horizontal 3
  [[0, 0], [0, 1], [0, 2]],
  // Horizontal 4
  [[0, 0], [0, 1], [0, 2], [0, 3]],
  // Horizontal 5
  [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]],
  // Vertical 2
  [[0, 0], [1, 0]],
  // Vertical 3
  [[0, 0], [1, 0], [2, 0]],
  // Vertical 4
  [[0, 0], [1, 0], [2, 0], [3, 0]],
  // Vertical 5
  [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]],
  // 2x2 square
  [[0, 0], [0, 1], [1, 0], [1, 1]],
  // 3x3 square
  [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]],
  // L shape
  [[0, 0], [1, 0], [2, 0], [2, 1]],
  // Reverse L
  [[0, 0], [0, 1], [1, 0], [2, 0]],
  // L right
  [[0, 0], [1, 0], [1, 1], [1, 2]],
  // Reverse L right
  [[0, 0], [0, 1], [0, 2], [1, 2]],
  // T shape
  [[0, 0], [0, 1], [0, 2], [1, 1]],
  // T upside down
  [[0, 1], [1, 0], [1, 1], [1, 2]],
  // T left
  [[0, 0], [1, 0], [1, 1], [2, 0]],
  // T right
  [[0, 0], [0, 1], [1, 0], [2, 0]],
  // Plus / Cross shape
  [[0, 1], [1, 0], [1, 1], [1, 2], [2, 1]],
  // Z shape
  [[0, 0], [0, 1], [1, 1], [1, 2]],
  // S shape
  [[0, 1], [0, 2], [1, 0], [1, 1]],
  // Small L (2x2 corner)
  [[0, 0], [0, 1], [1, 0]],
  // Small L reverse
  [[0, 0], [0, 1], [1, 1]],
  // Small L bottom
  [[0, 0], [1, 0], [1, 1]],
  // Small L bottom reverse
  [[0, 1], [1, 0], [1, 1]],
];

// Get a random color
function randomColor(): BlockColorName {
  return COLOR_NAMES[Math.floor(Math.random() * COLOR_NAMES.length)];
}

// Generate a random piece
export function generateRandomPiece(): PieceShape {
  const template = PIECE_TEMPLATES[Math.floor(Math.random() * PIECE_TEMPLATES.length)];
  return {
    cells: template.map(([r, c]) => [r, c]),
    color: randomColor(),
  };
}

// Generate a set of 3 pieces
export function generatePieceSet(): (PieceShape | null)[] {
  return [generateRandomPiece(), generateRandomPiece(), generateRandomPiece()];
}

// Grid cell type: null means empty, string means filled with that color
export type GridCell = BlockColorName | null;
export type Grid = GridCell[][];

// Create empty grid
export function createEmptyGrid(): Grid {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => null)
  );
}

// Check if a piece can be placed at a position
export function canPlacePiece(
  grid: Grid,
  piece: PieceShape,
  startRow: number,
  startCol: number
): boolean {
  for (const [r, c] of piece.cells) {
    const row = startRow + r;
    const col = startCol + c;
    if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) {
      return false;
    }
    if (grid[row][col] !== null) {
      return false;
    }
  }
  return true;
}

// Place a piece on the grid (returns new grid)
export function placePiece(
  grid: Grid,
  piece: PieceShape,
  startRow: number,
  startCol: number
): Grid {
  const newGrid = grid.map((row) => [...row]);
  for (const [r, c] of piece.cells) {
    newGrid[startRow + r][startCol + c] = piece.color;
  }
  return newGrid;
}

// Check and clear completed lines, returns { newGrid, clearedLines }
export interface ClearResult {
  newGrid: Grid;
  clearedRows: number[];
  clearedCols: number[];
  totalCleared: number;
}

export function checkAndClearLines(grid: Grid): ClearResult {
  const clearedRows: number[] = [];
  const clearedCols: number[] = [];

  // Check rows
  for (let r = 0; r < GRID_SIZE; r++) {
    if (grid[r].every((cell) => cell !== null)) {
      clearedRows.push(r);
    }
  }

  // Check columns
  for (let c = 0; c < GRID_SIZE; c++) {
    let full = true;
    for (let r = 0; r < GRID_SIZE; r++) {
      if (grid[r][c] === null) {
        full = false;
        break;
      }
    }
    if (full) {
      clearedCols.push(c);
    }
  }

  // Clear the lines
  const newGrid = grid.map((row) => [...row]);

  for (const r of clearedRows) {
    for (let c = 0; c < GRID_SIZE; c++) {
      newGrid[r][c] = null;
    }
  }

  for (const c of clearedCols) {
    for (let r = 0; r < GRID_SIZE; r++) {
      newGrid[r][c] = null;
    }
  }

  const totalCleared = clearedRows.length + clearedCols.length;

  return { newGrid, clearedRows, clearedCols, totalCleared };
}

// Calculate score for a placement
export function calculateScore(
  pieceCellCount: number,
  linesCleared: number
): number {
  // Base points for placing a piece
  let score = pieceCellCount;
  // Bonus for clearing lines (with combo multiplier)
  if (linesCleared > 0) {
    score += linesCleared * GRID_SIZE * linesCleared; // Combo bonus
  }
  return score;
}

// Check if any piece from the set can be placed anywhere
export function canAnyPieceBePlaced(
  grid: Grid,
  pieces: (PieceShape | null)[]
): boolean {
  for (const piece of pieces) {
    if (piece === null) continue;
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (canPlacePiece(grid, piece, r, c)) {
          return true;
        }
      }
    }
  }
  return false;
}

// Get the bounding box of a piece
export function getPieceBounds(piece: PieceShape): {
  rows: number;
  cols: number;
} {
  let maxRow = 0;
  let maxCol = 0;
  for (const [r, c] of piece.cells) {
    if (r > maxRow) maxRow = r;
    if (c > maxCol) maxCol = c;
  }
  return { rows: maxRow + 1, cols: maxCol + 1 };
}
