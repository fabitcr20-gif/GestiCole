import { Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormField, Input, Select, Textarea } from "@/components/ui/input";
import { ExamQuestionsEditor, type Question } from "@/components/exam-questions-editor";

export function ExamForm({
  action,
  sections,
  defaultValues,
}: {
  action: (formData: FormData) => void;
  sections: { id: string; name: string; subject: string }[];
  defaultValues?: {
    title?: string;
    subject?: string;
    sectionId?: string | null;
    instructions?: string;
    questions?: Question[];
  };
}) {
  return (
    <Card className="p-6 max-w-3xl">
      <form action={action} className="flex flex-col gap-5">
        <FormField label="Título de la prueba" htmlFor="title">
          <Input
            id="title"
            name="title"
            required
            defaultValue={defaultValues?.title}
            placeholder="Ej. Prueba corta - Fracciones"
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Materia (opcional)" htmlFor="subject">
            <Input id="subject" name="subject" defaultValue={defaultValues?.subject} />
          </FormField>
          <FormField label="Sección (opcional)" htmlFor="sectionId">
            <Select id="sectionId" name="sectionId" defaultValue={defaultValues?.sectionId ?? ""}>
              <option value="">Sin asignar</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {s.subject}
                </option>
              ))}
            </Select>
          </FormField>
        </div>

        <FormField label="Instrucciones (opcional)" htmlFor="instructions">
          <Textarea
            id="instructions"
            name="instructions"
            rows={2}
            defaultValue={defaultValues?.instructions}
            placeholder="Ej. Responda de forma clara y ordenada."
          />
        </FormField>

        <div>
          <h2 className="text-lg font-bold text-foreground mb-3">Preguntas</h2>
          <ExamQuestionsEditor initialQuestions={defaultValues?.questions ?? []} />
        </div>

        <Button type="submit" size="lg" icon={<Save size={22} aria-hidden />}>
          Guardar Cambios
        </Button>
      </form>
    </Card>
  );
}
