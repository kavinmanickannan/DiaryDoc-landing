// FDI two-digit tooth notation and odontogram status metadata.
// Client-safe: imported by the interactive chart — no db, no server-only.

// Arch rows in on-screen order, right quadrant → midline → left quadrant.
export const ADULT_UPPER = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
export const ADULT_LOWER = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
export const PRIMARY_UPPER = [55, 54, 53, 52, 51, 61, 62, 63, 64, 65];
export const PRIMARY_LOWER = [85, 84, 83, 82, 81, 71, 72, 73, 74, 75];

const ALL_FDI = new Set([
  ...ADULT_UPPER,
  ...ADULT_LOWER,
  ...PRIMARY_UPPER,
  ...PRIMARY_LOWER,
]);

export function isValidFdi(fdi: number): boolean {
  return ALL_FDI.has(fdi);
}

export function isPrimaryTooth(fdi: number): boolean {
  return fdi >= 51;
}

const QUADRANT_LABELS: Record<number, string> = {
  1: "Upper right",
  2: "Upper left",
  3: "Lower left",
  4: "Lower right",
  5: "Upper right",
  6: "Upper left",
  7: "Lower left",
  8: "Lower right",
};

const ADULT_POSITIONS = [
  "central incisor",
  "lateral incisor",
  "canine",
  "first premolar",
  "second premolar",
  "first molar",
  "second molar",
  "third molar",
];

const PRIMARY_POSITIONS = [
  "central incisor",
  "lateral incisor",
  "canine",
  "first molar",
  "second molar",
];

export function toothName(fdi: number): string {
  const quadrant = Math.floor(fdi / 10);
  const pos = fdi % 10;
  const positions = quadrant >= 5 ? PRIMARY_POSITIONS : ADULT_POSITIONS;
  const name = positions[pos - 1] ?? "tooth";
  const primary = quadrant >= 5 ? " (primary)" : "";
  return `${QUADRANT_LABELS[quadrant]} ${name}${primary}`;
}

// Anterior teeth (positions 1–3) have an incisal edge, not an occlusal surface.
export function isAnterior(fdi: number): boolean {
  return fdi % 10 <= 3;
}

// ── Status metadata (Build.md Phase 5 colour coding) ──────────

export const TOOTH_STATUSES = [
  { key: "HEALTHY", label: "Healthy", fill: "#f0fdf4", stroke: "#86efac", glyph: null },
  { key: "CARIES", label: "Active caries / decay", fill: "#ef4444", stroke: "#b91c1c", glyph: null },
  { key: "FILLED", label: "Restored (filling)", fill: "#facc15", stroke: "#a16207", glyph: null },
  { key: "RCT", label: "Root canal treated", fill: "#93c5fd", stroke: "#1d4ed8", glyph: "R" },
  { key: "CROWN", label: "Crown (PFM / Zirconia)", fill: "#d8b4fe", stroke: "#7e22ce", glyph: "C" },
  { key: "BRIDGE", label: "Bridge pontic / abutment", fill: "#99f6e4", stroke: "#0f766e", glyph: "B" },
  { key: "VENEER", label: "Veneer", fill: "#fbcfe8", stroke: "#be185d", glyph: "V" },
  { key: "IMPLANT", label: "Implant", fill: "#cbd5e1", stroke: "#475569", glyph: "⊥" },
  { key: "IMPACTED", label: "Impacted", fill: "#e0e7ff", stroke: "#4338ca", glyph: "⊘" },
  { key: "EXTRACTED", label: "Extracted", fill: "#334155", stroke: "#0f172a", glyph: "✕" },
  { key: "MISSING", label: "Missing", fill: "#e2e8f0", stroke: "#94a3b8", glyph: "✕" },
] as const;

export type ToothStatusKey = (typeof TOOTH_STATUSES)[number]["key"];

export function statusMeta(key: string) {
  return TOOTH_STATUSES.find((s) => s.key === key) ?? TOOTH_STATUSES[0];
}

// Only these statuses are marked per-surface; the rest colour the whole tooth.
export const SURFACE_STATUSES: ToothStatusKey[] = ["CARIES", "FILLED", "VENEER"];

// ── Current chart state ───────────────────────────────────────
// Append-only stream → latest event per tooth wins.

export type ToothEventLite = {
  toothFdi: number;
  status: string;
  surfaces: string[];
  note: string | null;
  createdAt: string; // ISO — serialised for client components
};

export type ChartState = Record<number, ToothEventLite>;

export function deriveChartState(eventsAsc: ToothEventLite[]): ChartState {
  const state: ChartState = {};
  for (const e of eventsAsc) state[e.toothFdi] = e;
  return state;
}

export function fdiToUniversal(fdi: number): string {
  // Adult upper
  if (fdi >= 11 && fdi <= 18) return String(9 - (fdi - 10)); // 18->1, 11->8
  if (fdi >= 21 && fdi <= 28) return String(fdi - 20 + 8);   // 21->9, 28->16
  // Adult lower
  if (fdi >= 31 && fdi <= 38) return String(25 - (fdi - 30)); // 31->24, 38->17
  if (fdi >= 41 && fdi <= 48) return String(fdi - 40 + 24);  // 41->25, 48->32

  // Primary upper
  if (fdi >= 51 && fdi <= 55) return String.fromCharCode(65 + (5 - (fdi - 50))); // 55->A (65), 51->E (69)
  if (fdi >= 61 && fdi <= 65) return String.fromCharCode(70 + (fdi - 60) - 1);  // 61->F (70), 65->J (74)
  // Primary lower
  if (fdi >= 71 && fdi <= 75) return String.fromCharCode(79 - (fdi - 70) + 1);  // 71->O (79), 75->K (75)
  if (fdi >= 81 && fdi <= 85) return String.fromCharCode(80 + (fdi - 80) - 1);  // 81->P (80), 85->T (84)

  return String(fdi);
}
