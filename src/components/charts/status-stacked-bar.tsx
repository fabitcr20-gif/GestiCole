"use client";

import { useState } from "react";
import { stackedSegmentPath } from "@/lib/svg-bar";

export type StatusSegment = {
  id: string;
  label: string;
  value: number;
  color: string;
  textColor: string;
};

const BAR_HEIGHT = 28;
const GAP = 2;
const RADIUS = 6;

/** Barra apilada horizontal para mostrar parte-todo (aprobados/reprobados/sin calificar). */
export function StatusStackedBar({ segments }: { segments: StatusSegment[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  if (total === 0) {
    return <p className="text-muted-foreground py-4 text-center">No hay notas registradas todavía.</p>;
  }

  const width = 560;
  const visible = segments.filter((s) => s.value > 0);
  const positioned = visible.reduce<{ segX: number; nextX: number }[]>((acc, s) => {
    const prevX = acc.length > 0 ? acc[acc.length - 1].nextX : 0;
    acc.push({ segX: prevX, nextX: prevX + (s.value / total) * width });
    return acc;
  }, []);

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${BAR_HEIGHT}`}
        role="img"
        aria-label="Distribución de aprobados, reprobados y sin calificar"
        className="w-full"
        style={{ height: BAR_HEIGHT }}
      >
        {visible.map((s, i) => {
          const segWidth = (s.value / total) * width - (i < visible.length - 1 ? GAP : 0);
          const segX = positioned[i].segX;
          const isHovered = hovered === s.id;
          const fitsLabel = segWidth > 46;
          return (
            <g
              key={s.id}
              onMouseEnter={() => setHovered(s.id)}
              onMouseLeave={() => setHovered((h) => (h === s.id ? null : h))}
            >
              <title>{`${s.label}: ${s.value} (${((s.value / total) * 100).toFixed(0)}%)`}</title>
              <path
                d={stackedSegmentPath(
                  segX,
                  0,
                  Math.max(0, segWidth),
                  BAR_HEIGHT,
                  RADIUS,
                  i === 0,
                  i === visible.length - 1
                )}
                fill={s.color}
                opacity={isHovered ? 1 : 0.92}
              />
              {fitsLabel && (
                <text
                  x={segX + segWidth / 2}
                  y={BAR_HEIGHT / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={12}
                  fontWeight={700}
                  fill={s.textColor}
                >
                  {s.value}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
        {segments.map((s) => (
          <li key={s.id} className="flex items-center gap-2 text-sm">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: s.color }}
              aria-hidden
            />
            <span className="text-foreground font-medium">{s.label}</span>
            <span className="text-muted-foreground">
              {s.value} ({total > 0 ? ((s.value / total) * 100).toFixed(0) : 0}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
