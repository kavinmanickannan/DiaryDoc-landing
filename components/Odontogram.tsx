"use client";

import {
  ADULT_LOWER,
  ADULT_UPPER,
  PRIMARY_LOWER,
  PRIMARY_UPPER,
  statusMeta,
  SURFACE_STATUSES,
  type ChartState,
  fdiToUniversal,
} from "@/lib/teeth";

// Geometry: each tooth is a 30×30 five-region surface diagram
// (mesial/distal/facial/lingual trapezoids around an occlusal centre)
// with the FDI number outside the arch.
const CELL = 40; // column width
const BOX = 30; // tooth box size
const INNER = 9; // inset of the occlusal centre square
const ROW_H = 52;
const MIDLINE_GAP = 14;
const PAD = 6;

function svgWidth(cols: number) {
  return PAD * 2 + cols * CELL + MIDLINE_GAP;
}

type Region = { key: string; points: string };

// Five regions of a BOX×BOX square (local coordinates).
function regions(): Region[] {
  const b = BOX;
  const i = INNER;
  return [
    { key: "top", points: `0,0 ${b},0 ${b - i},${i} ${i},${i}` },
    { key: "bottom", points: `0,${b} ${b},${b} ${b - i},${b - i} ${i},${b - i}` },
    { key: "left", points: `0,0 ${i},${i} ${i},${b - i} 0,${b}` },
    { key: "right", points: `${b},0 ${b - i},${i} ${b - i},${b - i} ${b},${b}` },
    { key: "center", points: `${i},${i} ${b - i},${i} ${b - i},${b - i} ${i},${b - i}` },
  ];
}

const REGIONS = regions();

/**
 * Map a diagram region to the tooth surface it shows.
 * Facial (B) faces outward — top of upper rows, bottom of lower rows.
 * Mesial faces the midline, so it flips at the middle of each row.
 */
function regionSurface(region: string, isUpper: boolean, mesialIsRight: boolean): string {
  switch (region) {
    case "top":
      return isUpper ? "B" : "L";
    case "bottom":
      return isUpper ? "L" : "B";
    case "left":
      return mesialIsRight ? "D" : "M";
    case "right":
      return mesialIsRight ? "M" : "D";
    default:
      return "O"; // centre — occlusal/incisal ("I" is treated as centre too)
  }
}

function Tooth({
  fdi,
  x,
  y,
  isUpper,
  mesialIsRight,
  state,
  selected,
  onSelect,
  useUniversal = false,
}: {
  fdi: number;
  x: number;
  y: number;
  isUpper: boolean;
  mesialIsRight: boolean;
  state?: { status: string; surfaces: string[] };
  selected: boolean;
  onSelect?: (fdi: number) => void;
  useUniversal?: boolean;
}) {
  const meta = statusMeta(state?.status ?? "HEALTHY");
  const healthy = statusMeta("HEALTHY");
  const perSurface =
    state != null &&
    SURFACE_STATUSES.includes(meta.key) &&
    state.surfaces.length > 0;

  const labelY = isUpper ? -4 : BOX + 12;

  return (
    <g
      transform={`translate(${x},${y})`}
      role={onSelect ? "button" : undefined} tabIndex={onSelect ? 0 : undefined} aria-label={`Tooth ${fdi}: ${meta.label}`} aria-pressed={selected} onKeyDown={onSelect ? (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(fdi); } } : undefined} onClick={onSelect ? () => onSelect(fdi) : undefined}
      className={onSelect ? "cursor-pointer" : undefined}
    >
      <text
        x={BOX / 2}
        y={labelY}
        textAnchor="middle"
        fontSize={11}
        fontWeight={selected ? 700 : 500}
        fill={selected ? "#0f766e" : "#475569"}
      >
        {useUniversal ? fdiToUniversal(fdi) : fdi}
      </text>
      {REGIONS.map((r) => {
        const surface = regionSurface(r.key, isUpper, mesialIsRight);
        const marked =
          perSurface &&
          (state!.surfaces.includes(surface) ||
            (surface === "O" && state!.surfaces.includes("I")));
        const fill = perSurface ? (marked ? meta.fill : healthy.fill) : meta.fill;
        return (
          <polygon
            key={r.key}
            points={r.points}
            fill={fill}
            stroke="#94a3b8"
            strokeWidth={0.5}
          />
        );
      })}
      {/* Whole-tooth glyph (crown, RCT, extraction cross…) */}
      {!perSurface && meta.glyph && (
        <text
          x={BOX / 2}
          y={BOX / 2 + 5}
          textAnchor="middle"
          fontSize={14}
          fontWeight={700}
          fill={meta.key === "EXTRACTED" ? "#ffffff" : meta.stroke}
        >
          {meta.glyph}
        </text>
      )}
      {/* Outline: status stroke, dashed for impacted, ring when selected */}
      <rect
        width={BOX}
        height={BOX}
        fill="none"
        stroke={selected ? "#0d9488" : meta.stroke}
        strokeWidth={selected ? 2.5 : 1.25}
        strokeDasharray={meta.key === "IMPACTED" ? "3 2" : undefined}
      />
    </g>
  );
}

function ArchRow({
  teeth,
  y,
  isUpper,
  cols,
  chart,
  selected,
  onSelect,
  useUniversal = false,
}: {
  teeth: number[];
  y: number;
  isUpper: boolean;
  cols: number;
  chart: ChartState;
  selected: number | null;
  onSelect?: (fdi: number) => void;
  useUniversal?: boolean;
}) {
  const half = teeth.length / 2;
  // Centre shorter (primary) rows under the widest row in view.
  const startX = PAD + ((cols - teeth.length) / 2) * CELL;
  return (
    <>
      {teeth.map((fdi, i) => {
        const gap = i >= half ? MIDLINE_GAP : 0;
        const x = startX + i * CELL + gap + (CELL - BOX) / 2;
        return (
          <Tooth
            key={fdi}
            fdi={fdi}
            x={x}
            y={y}
            isUpper={isUpper}
            mesialIsRight={i < half}
            state={chart[fdi]}
            selected={selected === fdi}
            onSelect={onSelect}
            useUniversal={useUniversal}
          />
        );
      })}
    </>
  );
}

export default function Odontogram({
  chart,
  showPrimary,
  showAdult = true,
  selected = null,
  onSelect,
  useUniversal = false,
}: {
  chart: ChartState;
  showPrimary: boolean;
  showAdult?: boolean; // false = primary-only view (paediatric chart, 14.9)
  selected?: number | null;
  onSelect?: (fdi: number) => void;
  useUniversal?: boolean;
}) {
  // Row order top→bottom: adult upper, primary upper, primary lower, adult lower.
  const rows: { teeth: number[]; isUpper: boolean }[] = [
    ...(showAdult ? [{ teeth: ADULT_UPPER, isUpper: true }] : []),
    ...(showPrimary
      ? [
          { teeth: PRIMARY_UPPER, isUpper: true },
          { teeth: PRIMARY_LOWER, isUpper: false },
        ]
      : []),
    ...(showAdult ? [{ teeth: ADULT_LOWER, isUpper: false }] : []),
  ];

  const cols = Math.max(...rows.map((r) => r.teeth.length));
  const height = rows.length * ROW_H + PAD * 2;

  return (
    <svg
      viewBox={`0 0 ${svgWidth(cols)} ${height}`}
      className="w-full"
      role="img"
      aria-label="Dental chart"
    >
      {rows.map((row, r) => (
        <ArchRow
          key={row.teeth[0]}
          teeth={row.teeth}
          y={PAD + r * ROW_H + (row.isUpper ? 16 : 6)}
          isUpper={row.isUpper}
          cols={cols}
          chart={chart}
          selected={selected}
          onSelect={onSelect}
          useUniversal={useUniversal}
        />
      ))}
    </svg>
  );
}

