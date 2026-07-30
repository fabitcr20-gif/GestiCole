"use client";

import { useState, useTransition } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Loader2,
  Save,
  FileUp,
  CheckCircle2,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormField, Input, Select, Textarea, Label } from "@/components/ui/input";
import {
  DUA_GUIDELINES,
  NIVELES_CICLO,
  PERIODICIDADES,
  getFrameworkByKey,
  guessFrameworkKey,
} from "@/lib/mep/pedagogical-frameworks";
import { createMepLessonPlan, type MepPlanFormInput } from "@/lib/actions/lesson-plans";
import { extractTextFromFileClient } from "@/lib/mep/extract-text-client";

type ReferenceDocument = {
  slot: "programa" | "guia" | "material";
  fileName: string;
  extractedText: string | null;
  status: "idle" | "loading" | "done" | "error";
  error?: string;
};

const MAX_UPLOAD_SIZE = 20 * 1024 * 1024;

const DOCUMENT_SLOTS: { slot: ReferenceDocument["slot"]; label: string; hint: string }[] = [
  { slot: "programa", label: "Programa de estudio oficial", hint: "PDF o texto del programa vigente del MEP (máximo 20 MB)." },
  { slot: "guia", label: "Guía de competencias MEP 2026", hint: "PDF o texto de la guía de competencias (máximo 20 MB)." },
  { slot: "material", label: "Material didáctico de apoyo", hint: "Cualquier otro material de referencia, opcional (máximo 20 MB)." },
];

const STEPS = [
  "Datos administrativos",
  "Contexto institucional y social",
  "Grupo y diversidad",
  "Apoyos DUA y adecuaciones",
  "Documentos de referencia",
  "Generar y revisar",
];

type FormState = {
  title: string;
  unit: string;
  sectionId: string;
  startDate: string;
  endDate: string;
  direccionRegional: string;
  centroEducativo: string;
  asignatura: string;
  nivelCiclo: string;
  periodicidad: string;
  cursoLectivo: string;
  competencias: string;
  institutionalContext: string;
  socialContext: string;
  groupCharacteristics: string;
  learningStyles: string;
  duaSupports: string[];
  specialEducationNeeds: string;
  objectives: string;
  strategies: string;
  evaluationCriteria: string;
  resources: string;
  reflection: string;
  notes: string;
};

const INITIAL_STATE: FormState = {
  title: "",
  unit: "",
  sectionId: "",
  startDate: "",
  endDate: "",
  direccionRegional: "",
  centroEducativo: "",
  asignatura: "",
  nivelCiclo: "",
  periodicidad: "",
  cursoLectivo: "2026",
  competencias: "",
  institutionalContext: "",
  socialContext: "",
  groupCharacteristics: "",
  learningStyles: "",
  duaSupports: [],
  specialEducationNeeds: "",
  objectives: "",
  strategies: "",
  evaluationCriteria: "",
  resources: "",
  reflection: "",
  notes: "",
};

export function MepPlanWizard({
  sections,
  claudeConfigured,
}: {
  sections: { id: string; name: string; subject: string }[];
  claudeConfigured: boolean;
}) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [documents, setDocuments] = useState<Record<string, ReferenceDocument>>({});
  const [pedagogicalApproach, setPedagogicalApproach] = useState<string>("");
  const [aiGenerated, setAiGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const predictedFrameworkKey = guessFrameworkKey(form.asignatura || form.title);
  const framework = getFrameworkByKey(pedagogicalApproach || predictedFrameworkKey);

  function toggleDua(key: string) {
    setForm((f) => ({
      ...f,
      duaSupports: f.duaSupports.includes(key)
        ? f.duaSupports.filter((k) => k !== key)
        : [...f.duaSupports, key],
    }));
  }

  async function handleFileChange(slot: ReferenceDocument["slot"], file: File | null) {
    if (!file) return;
    setDocuments((d) => ({ ...d, [slot]: { slot, fileName: file.name, extractedText: null, status: "loading" } }));

    if (file.size > MAX_UPLOAD_SIZE) {
      setDocuments((d) => ({
        ...d,
        [slot]: {
          slot,
          fileName: file.name,
          extractedText: null,
          status: "error",
          error: "El archivo es demasiado grande (máximo 20 MB). Intente con un archivo más pequeño.",
        },
      }));
      return;
    }

    try {
      const extractedText = await extractTextFromFileClient(file);
      setDocuments((d) => ({
        ...d,
        [slot]: { slot, fileName: file.name, extractedText, status: "done" },
      }));
    } catch (err) {
      setDocuments((d) => ({
        ...d,
        [slot]: {
          slot,
          fileName: file.name,
          extractedText: null,
          status: "error",
          error: err instanceof Error ? err.message : "No se pudo leer el documento",
        },
      }));
    }
  }

  function removeDocument(slot: string) {
    setDocuments((d) => {
      const next = { ...d };
      delete next[slot];
      return next;
    });
  }

  async function handleGenerate() {
    setGenerating(true);
    setGenerateError(null);
    try {
      const res = await fetch("/api/lesson-plans/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          unit: form.unit || undefined,
          asignatura: form.asignatura || undefined,
          nivelCiclo: form.nivelCiclo || undefined,
          periodicidad: form.periodicidad || undefined,
          competencias: form.competencias || undefined,
          institutionalContext: form.institutionalContext || undefined,
          socialContext: form.socialContext || undefined,
          groupCharacteristics: form.groupCharacteristics || undefined,
          learningStyles: form.learningStyles || undefined,
          duaSupports: form.duaSupports,
          specialEducationNeeds: form.specialEducationNeeds || undefined,
          referenceDocuments: Object.values(documents)
            .filter((d) => d.status === "done" && d.extractedText)
            .map((d) => ({ type: d.slot, fileName: d.fileName, extractedText: d.extractedText })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo generar el planeamiento con IA");
      setForm((f) => ({
        ...f,
        objectives: data.objectives,
        strategies: data.strategies,
        evaluationCriteria: data.evaluationCriteria,
        resources: data.resources,
        reflection: data.reflection,
      }));
      setPedagogicalApproach(data.frameworkKey);
      setAiGenerated(true);
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : "No se pudo generar el planeamiento con IA");
    } finally {
      setGenerating(false);
    }
  }

  function handleSave() {
    setSaveError(null);
    const input: MepPlanFormInput = {
      title: form.title,
      unit: form.unit || undefined,
      sectionId: form.sectionId || undefined,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      direccionRegional: form.direccionRegional || undefined,
      centroEducativo: form.centroEducativo || undefined,
      asignatura: form.asignatura || undefined,
      nivelCiclo: form.nivelCiclo || undefined,
      periodicidad: form.periodicidad || undefined,
      cursoLectivo: form.cursoLectivo ? Number(form.cursoLectivo) : undefined,
      competencias: form.competencias || undefined,
      institutionalContext: form.institutionalContext || undefined,
      socialContext: form.socialContext || undefined,
      groupCharacteristics: form.groupCharacteristics || undefined,
      learningStyles: form.learningStyles || undefined,
      duaSupports: form.duaSupports,
      specialEducationNeeds: form.specialEducationNeeds || undefined,
      pedagogicalApproach: pedagogicalApproach || predictedFrameworkKey,
      objectives: form.objectives,
      strategies: form.strategies,
      evaluationCriteria: form.evaluationCriteria,
      resources: form.resources || undefined,
      reflection: form.reflection || undefined,
      notes: form.notes || undefined,
      aiGenerated,
      documents: Object.values(documents)
        .filter((d) => d.status === "done" && d.extractedText)
        .map((d) => ({ type: d.slot, fileName: d.fileName, extractedText: d.extractedText })),
    };
    startSaving(async () => {
      try {
        await createMepLessonPlan(input);
      } catch (err) {
        const digest = (err as { digest?: string } | null)?.digest;
        if (digest?.startsWith("NEXT_REDIRECT")) throw err;
        setSaveError(err instanceof Error ? err.message : "No se pudo guardar el planeamiento");
      }
    });
  }

  const canAdvanceStep0 = form.title.trim().length > 0;

  return (
    <Card className="p-6 max-w-3xl">
      <ol className="mb-6 flex flex-wrap gap-2 text-sm font-semibold" aria-label="Progreso">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={
              i === step
                ? "rounded-full bg-primary px-3 py-1 text-primary-foreground"
                : i < step
                  ? "rounded-full bg-success-bg px-3 py-1 text-success"
                  : "rounded-full bg-slate-100 px-3 py-1 text-muted-foreground"
            }
          >
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="flex flex-col gap-5">
          <FormField label="Título del planeamiento" htmlFor="title">
            <Input
              id="title"
              required
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Ej. Fracciones y su aplicación en la vida cotidiana"
            />
          </FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Unidad temática (opcional)" htmlFor="unit">
              <Input id="unit" value={form.unit} onChange={(e) => update("unit", e.target.value)} />
            </FormField>
            <FormField label="Sección (opcional)" htmlFor="sectionId">
              <Select id="sectionId" value={form.sectionId} onChange={(e) => update("sectionId", e.target.value)}>
                <option value="">Sin asignar</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} · {s.subject}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Dirección Regional de Educación" htmlFor="direccionRegional">
              <Input
                id="direccionRegional"
                value={form.direccionRegional}
                onChange={(e) => update("direccionRegional", e.target.value)}
              />
            </FormField>
            <FormField label="Centro Educativo" htmlFor="centroEducativo">
              <Input
                id="centroEducativo"
                value={form.centroEducativo}
                onChange={(e) => update("centroEducativo", e.target.value)}
              />
            </FormField>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Asignatura / especialidad" htmlFor="asignatura" hint="Determina el modelo pedagógico del MEP a aplicar.">
              <Input
                id="asignatura"
                value={form.asignatura}
                onChange={(e) => update("asignatura", e.target.value)}
                placeholder="Ej. Matemática, Español, Ciencias..."
              />
            </FormField>
            <FormField label="Nivel / Ciclo" htmlFor="nivelCiclo">
              <Select id="nivelCiclo" value={form.nivelCiclo} onChange={(e) => update("nivelCiclo", e.target.value)}>
                <option value="">Seleccione...</option>
                {NIVELES_CICLO.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Periodicidad" htmlFor="periodicidad">
              <Select id="periodicidad" value={form.periodicidad} onChange={(e) => update("periodicidad", e.target.value)}>
                <option value="">Seleccione...</option>
                {PERIODICIDADES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Curso Lectivo" htmlFor="cursoLectivo">
              <Input
                id="cursoLectivo"
                type="number"
                value={form.cursoLectivo}
                onChange={(e) => update("cursoLectivo", e.target.value)}
              />
            </FormField>
          </div>
          <FormField label="Competencia(s) general(es) del periodo" htmlFor="competencias">
            <Textarea
              id="competencias"
              rows={2}
              value={form.competencias}
              onChange={(e) => update("competencias", e.target.value)}
            />
          </FormField>
          {form.asignatura && (
            <p className="text-muted-foreground">
              Modelo pedagógico MEP detectado: <strong className="text-foreground">{getFrameworkByKey(predictedFrameworkKey)?.label}</strong>
            </p>
          )}
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-5">
          <FormField
            label="Contexto institucional"
            htmlFor="institutionalContext"
            hint="Infraestructura, conectividad y recursos tecnológicos disponibles."
          >
            <Textarea
              id="institutionalContext"
              rows={5}
              value={form.institutionalContext}
              onChange={(e) => update("institutionalContext", e.target.value)}
            />
          </FormField>
          <FormField
            label="Contexto social y comunitario"
            htmlFor="socialContext"
            hint="Características socioeconómicas y culturales de la comunidad educativa."
          >
            <Textarea
              id="socialContext"
              rows={5}
              value={form.socialContext}
              onChange={(e) => update("socialContext", e.target.value)}
            />
          </FormField>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-5">
          <FormField
            label="Características del grupo"
            htmlFor="groupCharacteristics"
            hint="Matrícula, distribución por género, clima de aula."
          >
            <Textarea
              id="groupCharacteristics"
              rows={5}
              value={form.groupCharacteristics}
              onChange={(e) => update("groupCharacteristics", e.target.value)}
            />
          </FormField>
          <FormField
            label="Estilos y ritmos de aprendizaje"
            htmlFor="learningStyles"
            hint="¿Cómo aprende mejor el grupo? Visual, auditivo, kinestésico, ritmos variados, etc."
          >
            <Textarea
              id="learningStyles"
              rows={5}
              value={form.learningStyles}
              onChange={(e) => update("learningStyles", e.target.value)}
            />
          </FormField>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-lg font-bold text-foreground mb-1">Apoyos DUA (Diseño Universal para el Aprendizaje)</p>
            <p className="text-muted-foreground mb-4">
              Marque las pautas que desea que la IA integre dentro de las estrategias de mediación.
            </p>
            <DuaGroup title="Representación" principle="representacion" selected={form.duaSupports} onToggle={toggleDua} />
            <DuaGroup title="Acción y Expresión" principle="accionExpresion" selected={form.duaSupports} onToggle={toggleDua} />
            <DuaGroup
              title="Implicación y Motivación"
              principle="implicacionMotivacion"
              selected={form.duaSupports}
              onToggle={toggleDua}
            />
          </div>
          <FormField
            label="Adecuaciones curriculares / necesidades educativas especiales (opcional)"
            htmlFor="specialEducationNeeds"
            hint="Acceso, no significativas o significativas — describa lo que el docente debe considerar."
          >
            <Textarea
              id="specialEducationNeeds"
              rows={4}
              value={form.specialEducationNeeds}
              onChange={(e) => update("specialEducationNeeds", e.target.value)}
            />
          </FormField>
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-col gap-5">
          <p className="text-muted-foreground">
            Adjunte documentos oficiales (PDF o texto) para que la IA los use como referencia principal. Todos son opcionales.
          </p>
          {DOCUMENT_SLOTS.map(({ slot, label, hint }) => {
            const doc = documents[slot];
            return (
              <div key={slot} className="rounded-xl border border-border p-4">
                <Label htmlFor={`file-${slot}`} hint={hint}>
                  {label}
                </Label>
                <div className="mt-2 flex items-center gap-3 flex-wrap">
                  <label className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-base font-semibold text-foreground shadow-sm hover:bg-slate-50 cursor-pointer">
                    <FileUp size={18} aria-hidden />
                    Elegir archivo
                    <input
                      id={`file-${slot}`}
                      type="file"
                      accept=".pdf,.txt,text/plain,application/pdf"
                      className="hidden"
                      onChange={(e) => handleFileChange(slot, e.target.files?.[0] ?? null)}
                    />
                  </label>
                  {doc?.status === "loading" && (
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Loader2 size={16} className="animate-spin" aria-hidden /> Leyendo {doc.fileName}...
                    </span>
                  )}
                  {doc?.status === "done" && (
                    <span className="flex items-center gap-1.5 text-success font-semibold">
                      <CheckCircle2 size={16} aria-hidden /> {doc.fileName}
                      <button
                        type="button"
                        onClick={() => removeDocument(slot)}
                        className="ml-2 text-muted-foreground hover:text-danger cursor-pointer"
                        aria-label={`Quitar ${doc.fileName}`}
                      >
                        <Trash2 size={16} aria-hidden />
                      </button>
                    </span>
                  )}
                  {doc?.status === "error" && (
                    <span className="flex items-center gap-1.5 text-danger font-semibold">
                      <AlertTriangle size={16} aria-hidden /> {doc.error}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {step === 5 && (
        <div className="flex flex-col gap-5">
          {!claudeConfigured && (
            <div className="rounded-xl border border-warning-border bg-warning-bg p-4 text-warning">
              La generación con IA todavía no está configurada (falta la clave de Anthropic). Puede escribir el
              contenido manualmente abajo y guardarlo igual.
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              size="lg"
              icon={generating ? <Loader2 size={22} className="animate-spin" aria-hidden /> : <Sparkles size={22} aria-hidden />}
              onClick={handleGenerate}
              disabled={generating || !claudeConfigured || !form.title.trim()}
            >
              {generating ? "Generando con IA..." : "Generar con IA"}
            </Button>
            {framework && (
              <span className="text-muted-foreground">
                Modelo aplicado: <strong className="text-foreground">{framework.label}</strong>
              </span>
            )}
          </div>
          {generateError && (
            <p className="flex items-center gap-1.5 text-danger font-semibold">
              <AlertTriangle size={16} aria-hidden /> {generateError}
            </p>
          )}

          <FormField label="Aprendizajes esperados" htmlFor="objectives">
            <Textarea
              id="objectives"
              rows={4}
              required
              value={form.objectives}
              onChange={(e) => update("objectives", e.target.value)}
            />
          </FormField>
          <FormField label="Estrategias de mediación pedagógica" htmlFor="strategies">
            <Textarea
              id="strategies"
              rows={8}
              required
              value={form.strategies}
              onChange={(e) => update("strategies", e.target.value)}
            />
          </FormField>
          <FormField label="Indicadores / criterios de evaluación" htmlFor="evaluationCriteria">
            <Textarea
              id="evaluationCriteria"
              rows={4}
              required
              value={form.evaluationCriteria}
              onChange={(e) => update("evaluationCriteria", e.target.value)}
            />
          </FormField>
          <FormField label="Recursos y materiales" htmlFor="resources">
            <Textarea id="resources" rows={3} value={form.resources} onChange={(e) => update("resources", e.target.value)} />
          </FormField>
          <FormField label="Reflexión docente (opcional)" htmlFor="reflection">
            <Textarea id="reflection" rows={3} value={form.reflection} onChange={(e) => update("reflection", e.target.value)} />
          </FormField>
          <FormField label="Notas adicionales (opcional)" htmlFor="notes">
            <Textarea id="notes" rows={2} value={form.notes} onChange={(e) => update("notes", e.target.value)} />
          </FormField>

          {saveError && (
            <p className="flex items-center gap-1.5 text-danger font-semibold">
              <AlertTriangle size={16} aria-hidden /> {saveError}
            </p>
          )}
          <Button
            type="button"
            size="lg"
            icon={saving ? <Loader2 size={22} className="animate-spin" aria-hidden /> : <Save size={22} aria-hidden />}
            onClick={handleSave}
            disabled={saving || !form.title.trim() || !form.objectives.trim() || !form.strategies.trim() || !form.evaluationCriteria.trim()}
          >
            {saving ? "Guardando..." : "Guardar planeamiento"}
          </Button>
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <Button
          type="button"
          variant="secondary"
          icon={<ArrowLeft size={20} aria-hidden />}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          Atrás
        </Button>
        {step < STEPS.length - 1 && (
          <Button
            type="button"
            icon={<ArrowRight size={20} aria-hidden />}
            onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
            disabled={step === 0 && !canAdvanceStep0}
          >
            Siguiente
          </Button>
        )}
      </div>
    </Card>
  );
}

function DuaGroup({
  title,
  principle,
  selected,
  onToggle,
}: {
  title: string;
  principle: keyof typeof DUA_GUIDELINES;
  selected: string[];
  onToggle: (key: string) => void;
}) {
  return (
    <div className="mb-4">
      <p className="font-semibold text-foreground mb-2">{title}</p>
      <div className="flex flex-col gap-2">
        {DUA_GUIDELINES[principle].map((guideline, i) => {
          const key = `${principle}:${i}`;
          const checked = selected.includes(key);
          return (
            <label key={key} className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(key)}
                className="mt-1 h-5 w-5 accent-[var(--color-primary)]"
              />
              <span className="text-foreground">{guideline}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
