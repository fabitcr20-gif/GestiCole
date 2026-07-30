"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, CheckCircle2 } from "lucide-react";
import clsx from "clsx";
import { computeWeightedAverage } from "@/lib/grades";
import { Button } from "@/components/ui/button";

type Student = { id: string; fullName: string; studentCode: string | null };
type Component = { id: string; name: string; weight: number };

export function GradeGrid({
  sectionId,
  period,
  students,
  components,
  initialScores,
}: {
  sectionId: string;
  period: string;
  students: Student[];
  components: Component[];
  /** studentId -> componentId -> score */
  initialScores: Record<string, Record<string, number | null>>;
}) {
  const [scores, setScores] =
    useState<Record<string, Record<string, number | null>>>(initialScores);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  const cellKey = (row: number, col: number) => `${row}-${col}`;

  function setScore(studentId: string, componentId: string, value: number | null) {
    setSaved(false);
    setScores((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [componentId]: value },
    }));
  }

  function focusCell(row: number, col: number) {
    const clampedRow = Math.max(0, Math.min(students.length - 1, row));
    const clampedCol = Math.max(0, Math.min(components.length - 1, col));
    const el = inputRefs.current.get(cellKey(clampedRow, clampedCol));
    el?.focus();
    el?.select();
  }

  function handleKeyDown(e: React.KeyboardEvent, row: number, col: number) {
    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        focusCell(row - 1, col);
        break;
      case "ArrowDown":
      case "Enter":
        e.preventDefault();
        focusCell(row + 1, col);
        break;
      case "ArrowLeft":
        if ((e.target as HTMLInputElement).selectionStart === 0) {
          e.preventDefault();
          focusCell(row, col - 1);
        }
        break;
      case "ArrowRight": {
        const target = e.target as HTMLInputElement;
        if (target.selectionStart === target.value.length) {
          e.preventDefault();
          focusCell(row, col + 1);
        }
        break;
      }
      case "Tab":
        // Deja el comportamiento nativo del navegador (orden natural de tabulación).
        break;
    }
  }

  const results = useMemo(
    () =>
      students.map((student) => {
        const studentScores = new Map(
          components.map((c) => [c.id, scores[student.id]?.[c.id] ?? null])
        );
        return {
          student,
          ...computeWeightedAverage(components, studentScores),
        };
      }),
    [students, components, scores]
  );

  function handleSave() {
    const payload = {
      scores: students.flatMap((student) =>
        components.map((component) => ({
          studentId: student.id,
          componentId: component.id,
          score: scores[student.id]?.[component.id] ?? null,
        }))
      ),
    };

    startTransition(async () => {
      const res = await fetch(`/api/sections/${sectionId}/grades`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSaved(true);
        router.refresh();
      }
    });
  }

  if (components.length === 0) {
    return (
      <p className="text-lg text-muted-foreground">
        Primero configure los rubros y porcentajes en la sección de{" "}
        <a className="text-primary underline" href={`/secciones/${sectionId}/componentes?periodo=${period}`}>
          Porcentajes
        </a>
        .
      </p>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <Button onClick={handleSave} disabled={isPending} icon={<Save size={20} aria-hidden />}>
          {isPending ? "Guardando..." : "Guardar Cambios"}
        </Button>
        {saved && !isPending && (
          <span className="flex items-center gap-1.5 text-success font-semibold">
            <CheckCircle2 size={20} aria-hidden />
            Guardado
          </span>
        )}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-border">
              <th className="sticky left-0 bg-slate-50 px-4 py-3 text-left text-base font-semibold text-foreground border-r border-border min-w-[220px]">
                Estudiante
              </th>
              {components.map((c) => (
                <th
                  key={c.id}
                  className="px-3 py-3 text-center text-base font-semibold text-foreground min-w-[110px]"
                >
                  {c.name}
                  <span className="block text-xs font-normal text-muted-foreground">
                    {c.weight}%
                  </span>
                </th>
              ))}
              <th className="px-4 py-3 text-center text-base font-semibold text-foreground min-w-[110px] bg-slate-100">
                Promedio
              </th>
            </tr>
          </thead>
          <tbody>
            {results.map(({ student, average }, row) => (
              <tr key={student.id} className="border-b border-border last:border-0 even:bg-slate-50/50">
                <td className="sticky left-0 bg-inherit px-4 py-2 text-lg text-foreground border-r border-border whitespace-nowrap">
                  {student.fullName}
                </td>
                {components.map((component, col) => (
                  <td key={component.id} className="p-1 text-center">
                    <input
                      ref={(el) => {
                        if (el) inputRefs.current.set(cellKey(row, col), el);
                      }}
                      type="number"
                      inputMode="decimal"
                      min={0}
                      max={100}
                      step="0.5"
                      value={scores[student.id]?.[component.id] ?? ""}
                      onChange={(e) => {
                        const raw = e.target.value;
                        setScore(
                          student.id,
                          component.id,
                          raw === "" ? null : Math.max(0, Math.min(100, Number(raw)))
                        );
                      }}
                      onKeyDown={(e) => handleKeyDown(e, row, col)}
                      aria-label={`${student.fullName} - ${component.name}`}
                      className={clsx(
                        "w-20 rounded-lg border border-border bg-white px-2 py-2 text-center text-lg",
                        "focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none"
                      )}
                    />
                  </td>
                ))}
                <td className="px-4 py-2 text-center font-bold bg-slate-50">
                  <span
                    className={clsx(
                      average === null
                        ? "text-muted-foreground"
                        : average >= 70
                          ? "text-success"
                          : "text-danger"
                    )}
                  >
                    {average !== null ? average.toFixed(1) : "—"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-sm text-muted-foreground">
        Use las flechas del teclado para moverse entre celdas, igual que en una hoja de cálculo.
        No olvide presionar <strong>Guardar Cambios</strong> al terminar.
      </p>
    </div>
  );
}
