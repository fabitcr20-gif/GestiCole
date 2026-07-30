import { Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormField, Input, Select, Textarea } from "@/components/ui/input";

export function LessonPlanForm({
  action,
  sections,
  defaultValues,
}: {
  action: (formData: FormData) => void;
  sections: { id: string; name: string; subject: string }[];
  defaultValues?: {
    title?: string;
    unit?: string;
    sectionId?: string | null;
    startDate?: string;
    endDate?: string;
    objectives?: string;
    strategies?: string;
    evaluationCriteria?: string;
    resources?: string;
    notes?: string;
  };
}) {
  return (
    <Card className="p-6 max-w-3xl">
      <form action={action} className="flex flex-col gap-5">
        <FormField label="Título del planeamiento" htmlFor="title">
          <Input
            id="title"
            name="title"
            required
            defaultValue={defaultValues?.title}
            placeholder="Ej. Introducción a las fracciones"
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Unidad temática (opcional)" htmlFor="unit">
            <Input id="unit" name="unit" defaultValue={defaultValues?.unit} />
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Fecha de inicio (opcional)" htmlFor="startDate">
            <Input id="startDate" name="startDate" type="date" defaultValue={defaultValues?.startDate} />
          </FormField>
          <FormField label="Fecha de fin (opcional)" htmlFor="endDate">
            <Input id="endDate" name="endDate" type="date" defaultValue={defaultValues?.endDate} />
          </FormField>
        </div>

        <FormField
          label="Objetivos de aprendizaje"
          htmlFor="objectives"
          hint="¿Qué se espera que el estudiante logre?"
        >
          <Textarea
            id="objectives"
            name="objectives"
            required
            rows={3}
            defaultValue={defaultValues?.objectives}
          />
        </FormField>

        <FormField
          label="Estrategias de mediación"
          htmlFor="strategies"
          hint="¿Cómo se va a enseñar? Actividades, dinámicas, materiales."
        >
          <Textarea
            id="strategies"
            name="strategies"
            required
            rows={4}
            defaultValue={defaultValues?.strategies}
          />
        </FormField>

        <FormField
          label="Criterios de evaluación"
          htmlFor="evaluationCriteria"
          hint="¿Cómo se va a comprobar que el estudiante aprendió?"
        >
          <Textarea
            id="evaluationCriteria"
            name="evaluationCriteria"
            required
            rows={3}
            defaultValue={defaultValues?.evaluationCriteria}
          />
        </FormField>

        <FormField label="Recursos y materiales (opcional)" htmlFor="resources">
          <Textarea id="resources" name="resources" rows={2} defaultValue={defaultValues?.resources} />
        </FormField>

        <FormField label="Notas adicionales (opcional)" htmlFor="notes">
          <Textarea id="notes" name="notes" rows={2} defaultValue={defaultValues?.notes} />
        </FormField>

        <Button type="submit" size="lg" icon={<Save size={22} aria-hidden />}>
          Guardar Cambios
        </Button>
      </form>
    </Card>
  );
}
