"use client";

import { useId, useState } from "react";
import { horizontalBarPath } from "@/lib/svg-bar";

export type BarDatum = {
  id: string;
  label: string;
  value: number;
  color: string;
  hint?: string;
};

const BAR_HEIGHT = 20;
const ROW_GAP = 14;
const BAR_RADIUS = 4;

/**
 * Gráfico de barras horizontales de una sola magnitud por categoría.
 * El color de cada barra viene dado por el llamador (identidad de sección
 * o color de estado aprobado/reprobado), nunca generado.
 */
export function HorizontalBarChart({
  data,
  format = "decimal",
  referenceLine,
  referenceLabel,
  maxValue,
  emptyMessage = "No hay datos todavía.",
}: {
  data: BarDatum[];
  /** "decimal" para notas (85.5), "integer" para conteos (12 estudiantes). */
  format?: "decimal" | "integer";
  referenceLine?: number;
  referenceLabel?: string;
  maxValue?: number;
  emptyMessage?: string;
}) {
  const valueFormatter = (v: number) => (format === "integer" ? v.toFixed(0) : v.toFixed(1));
  const gradientId = useId();
  const [hovered, setHovered] = useState<string | null>(null);

  if (data.length === 0) {
    return <p className="text-muted-foreground py-6 text-center">{emptyMessage}</p>;
  }

  const width = 560;
  const labelWidth = 140;
  const valueWidth = 56;
  const chartWidth = width - labelWidth - valueWidth;
  const rowHeight = BAR_HEIGHT + ROW_GAP;
  const height = data.length * rowHeight;
  const max = maxValue ?? Math.max(...data.map((d) => d.value), 1);
  const refX =
    referenceLine !== undefined ? (referenceLine / max) * chartWidth : undefined;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Gráfico de barras"
        className="w-full min-w-[420px]"
        style={{ height: "auto" }}
      >
        <defs>
          <clipPath id={`${gradientId}-clip`}>
            <rect x={0} y={0} width={width} height={height} />
          </clipPath>
        </defs>

        {refX !== undefined && (
          <g>
            <line
              x1={labelWidth + refX}
              x2={labelWidth + refX}
              y1={0}
              y2={height}
              stroke="var(--color-warning)"
              strokeDasharray="3 3"
              strokeWidth={1}
            />
            {referenceLabel && (
              <text
                x={labelWidth + refX}
                y={-4}
                textAnchor="middle"
                className="fill-warning"
                fontSize={10}
                fontWeight={600}
              >
                {referenceLabel}
              </text>
            )}
          </g>
        )}

        {data.map((d, i) => {
          const y = i * rowHeight;
          const barWidth = Math.max(0, (d.value / max) * chartWidth);
          const isHovered = hovered === d.id;
          return (
            <g
              key={d.id}
              onMouseEnter={() => setHovered(d.id)}
              onMouseLeave={() => setHovered((h) => (h === d.id ? null : h))}
            >
              <title>{`${d.label}: ${valueFormatter(d.value)}${d.hint ? ` (${d.hint})` : ""}`}</title>
              <text
                x={labelWidth - 10}
                y={y + BAR_HEIGHT / 2}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize={13}
                className="fill-foreground"
                fontWeight={isHovered ? 700 : 500}
              >
                {d.label.length > 16 ? `${d.label.slice(0, 15)}…` : d.label}
              </text>
              <rect
                x={labelWidth}
                y={y}
                width={chartWidth}
                height={BAR_HEIGHT}
                className="fill-border"
                opacity={0.25}
                rx={BAR_RADIUS}
              />
              <path
                d={horizontalBarPath(labelWidth, y, barWidth, BAR_HEIGHT, BAR_RADIUS)}
                fill={d.color}
                opacity={isHovered ? 1 : 0.92}
              />
              <text
                x={labelWidth + barWidth + 8}
                y={y + BAR_HEIGHT / 2}
                dominantBaseline="middle"
                fontSize={13}
                fontWeight={700}
                className="fill-foreground"
              >
                {valueFormatter(d.value)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
