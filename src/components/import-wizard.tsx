"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, CheckCircle2, AlertTriangle, FileSpreadsheet } from "lucide-react";
import { parseImportFile, guessFieldMapping, type ParsedFile } from "@/lib/import/parse-file";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

type FieldTarget = "fullName" | "studentCode" | "email" | "ignore" | string;

const FIXED_OPTIONS: { value: FieldTarget; label: string }[] = [
  { value: "fullName", label: "Nombre del estudiante" },
  { value: "studentCode", label: "Código / cédula" },
  { value: "email", label: "Correo electrónico" },
  { value: "ignore", label: "No importar esta columna" },
];

export function ImportWizard({
  sectionId,
  gradeComponents,
}: {
  sectionId: string;
  gradeComponents: { id: string; name: string; period: string }[];
}) {
  const [parsed, setParsed] = useState<ParsedFile | null>(null);
  const [mapping, setMapping] = useState<Record<string, FieldTarget>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ created: number; updated: number; gradesWritten: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const componentOptions = gradeComponents.map((c) => ({
    value: `grade:${c.id}`,
    label: `Nota: ${c.name} (${c.period})`,
  }));

  async function handleFile(file: File) {
    setError(null);
    setStatus("loading");
    try {
      const result = await parseImportFile(file);
      setParsed(result);
      setMapping(guessFieldMapping(result.headers));
      setStatus("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo leer el archivo");
      setStatus("error");
    }
  }

  async function handleConfirm() {
    if (!parsed) return;
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch(`/api/sections/${sectionId}/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: parsed.rows, mapping }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo importar el archivo");
      setResult(data);
      setStatus("done");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo importar el archivo");
      setStatus("error");
    }
  }

  if (status === "done" && result) {
    return (
      <Card className="p-6 max-w-2xl">
        <div className="flex items-center gap-3 text-success mb-2">
          <CheckCircle2 size={28} aria-hidden />
          <p className="text-xl font-bold">¡Importación completada!</p>
        </div>
        <ul className="text-lg text-foreground list-disc list-inside">
          <li>{result.created} estudiante(s) nuevo(s) agregado(s)</li>
          <li>{result.updated} estudiante(s) actualizado(s)</li>
          {result.gradesWritten > 0 && <li>{result.gradesWritten} nota(s) importada(s)</li>}
        </ul>
        <Button
          className="mt-4"
          onClick={() => {
            setParsed(null);
            setResult(null);
            setStatus("idle");
          }}
        >
          Importar otro archivo
        </Button>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {!parsed && (
        <Card className="p-8 text-center border-dashed">
          <UploadCloud className="mx-auto text-primary" size={44} aria-hidden />
          <p className="mt-3 text-lg font-semibold text-foreground">
            Seleccione el archivo con su lista de estudiantes
          </p>
          <p className="text-muted-foreground mt-1">
            Formatos aceptados: Excel (.xlsx, .xls), CSV o JSON. Por ejemplo, un archivo
            exportado del SEA del MEP.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <Button
            className="mt-4"
            onClick={() => fileInputRef.current?.click()}
            icon={<FileSpreadsheet size={20} aria-hidden />}
          >
            Elegir archivo
          </Button>
          {status === "loading" && <p className="mt-3 text-muted-foreground">Leyendo archivo...</p>}
          {error && (
            <p className="mt-3 flex items-center justify-center gap-2 text-danger font-semibold">
              <AlertTriangle size={18} aria-hidden /> {error}
            </p>
          )}
        </Card>
      )}

      {parsed && (
        <>
          <Card className="p-6">
            <h2 className="text-lg font-bold text-foreground mb-1">
              Paso 1: Indique qué contiene cada columna
            </h2>
            <p className="text-muted-foreground mb-4">
              Detectamos estas columnas en su archivo ({parsed.rows.length} fila(s)). Revise que
              la asignación sea correcta antes de continuar.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {parsed.headers.map((header) => (
                <div key={header}>
                  <label className="block text-sm font-semibold text-foreground mb-1">
                    Columna: &ldquo;{header}&rdquo;
                  </label>
                  <Select
                    value={mapping[header] ?? "ignore"}
                    onChange={(e) =>
                      setMapping((prev) => ({ ...prev, [header]: e.target.value }))
                    }
                  >
                    {FIXED_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                    {componentOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Select>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 overflow-x-auto">
            <h2 className="text-lg font-bold text-foreground mb-3">
              Paso 2: Revise una vista previa
            </h2>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  {parsed.headers.map((h) => (
                    <th key={h} className="px-3 py-2 font-semibold text-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsed.rows.slice(0, 5).map((row, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    {parsed.headers.map((h) => (
                      <td key={h} className="px-3 py-2 text-muted-foreground">
                        {row[h]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {error && (
            <p className="flex items-center gap-2 text-danger font-semibold">
              <AlertTriangle size={18} aria-hidden /> {error}
            </p>
          )}

          <div className="flex gap-3">
            <Button onClick={handleConfirm} disabled={status === "loading"} size="lg">
              {status === "loading" ? "Importando..." : "Confirmar importación"}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                setParsed(null);
                setError(null);
              }}
            >
              Cancelar
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
