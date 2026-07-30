"use client";

import { useState } from "react";
import { PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField, Input, Select, Textarea } from "@/components/ui/input";

export type Question = {
  type: "desarrollo" | "seleccion" | "corta";
  prompt: string;
  points: number;
  options?: string[];
};

const TYPE_LABELS: Record<Question["type"], string> = {
  desarrollo: "Desarrollo",
  seleccion: "Selección única",
  corta: "Respuesta corta",
};

const DEFAULT_QUESTION: Question = { type: "desarrollo", prompt: "", points: 10 };

export function ExamQuestionsEditor({ initialQuestions }: { initialQuestions: Question[] }) {
  const [questions, setQuestions] = useState<Question[]>(
    initialQuestions.length > 0 ? initialQuestions : [DEFAULT_QUESTION]
  );

  function update(index: number, patch: Partial<Question>) {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, { ...DEFAULT_QUESTION, prompt: "" }]);
  }

  function removeQuestion(index: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }

  function addOption(index: number) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, options: [...(q.options ?? []), ""] } : q))
    );
  }

  function updateOption(index: number, optIndex: number, value: string) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === index
          ? { ...q, options: q.options?.map((o, oi) => (oi === optIndex ? value : o)) }
          : q
      )
    );
  }

  function removeOption(index: number, optIndex: number) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === index ? { ...q, options: q.options?.filter((_, oi) => oi !== optIndex) } : q
      )
    );
  }

  const totalPoints = questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0);

  return (
    <div>
      <input type="hidden" name="questionsJson" value={JSON.stringify(questions)} />

      <div className="flex flex-col gap-5">
        {questions.map((question, index) => (
          <div key={index} className="rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-foreground">Pregunta {index + 1}</p>
              <button
                type="button"
                onClick={() => removeQuestion(index)}
                className="text-danger hover:text-danger flex items-center gap-1 text-sm font-semibold"
              >
                <Trash2 size={16} aria-hidden /> Eliminar
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
              <FormField label="Tipo" htmlFor={`type-${index}`}>
                <Select
                  id={`type-${index}`}
                  value={question.type}
                  onChange={(e) =>
                    update(index, { type: e.target.value as Question["type"] })
                  }
                >
                  {Object.entries(TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Puntos" htmlFor={`points-${index}`}>
                <Input
                  id={`points-${index}`}
                  type="number"
                  min={0}
                  step="0.5"
                  value={question.points}
                  onChange={(e) => update(index, { points: Number(e.target.value) })}
                />
              </FormField>
            </div>

            <FormField label="Enunciado" htmlFor={`prompt-${index}`}>
              <Textarea
                id={`prompt-${index}`}
                rows={2}
                value={question.prompt}
                onChange={(e) => update(index, { prompt: e.target.value })}
              />
            </FormField>

            {question.type === "seleccion" && (
              <div className="mt-3">
                <p className="text-base font-semibold text-foreground mb-2">Opciones</p>
                <div className="flex flex-col gap-2">
                  {(question.options ?? []).map((option, optIndex) => (
                    <div key={optIndex} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, optIndex, e.target.value)}
                        placeholder={`Opción ${optIndex + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeOption(index, optIndex)}
                        className="text-danger px-2"
                        aria-label="Eliminar opción"
                      >
                        <Trash2 size={18} aria-hidden />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => addOption(index)}
                  className="mt-2 text-primary font-semibold text-sm flex items-center gap-1"
                >
                  <PlusCircle size={16} aria-hidden /> Agregar opción
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4">
        <Button type="button" variant="secondary" onClick={addQuestion} icon={<PlusCircle size={18} aria-hidden />}>
          Agregar pregunta
        </Button>
        <p className="font-semibold text-foreground">Puntos totales: {totalPoints}</p>
      </div>
    </div>
  );
}
