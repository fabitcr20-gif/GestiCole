import { notFound } from "next/navigation";
import { Trash2, PlusCircle, Save, CheckCircle2, AlertTriangle } from "lucide-react";
import { getCurrentTeacher } from "@/lib/current-teacher";
import { prisma } from "@/lib/prisma";
import { PERIOD_LABELS, PERIODS } from "@/lib/grades";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/input";
import {
  addGradeComponent,
  updateGradeComponent,
  deleteGradeComponent,
} from "@/lib/actions/components";

export default async function GradeComponentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ periodo?: string }>;
}) {
  const { id } = await params;
  const { periodo } = await searchParams;
  const period = periodo && PERIODS.includes(periodo as (typeof PERIODS)[number]) ? periodo : "I";

  const teacher = await getCurrentTeacher();
  if (!teacher) return null;

  const section = await prisma.section.findFirst({
    where: { id, teacherId: teacher.id },
  });
  if (!section) notFound();

  const components = await prisma.gradeComponent.findMany({
    where: { sectionId: section.id, period },
    orderBy: { order: "asc" },
  });

  const totalWeight = components.reduce((sum, c) => sum + c.weight, 0);
  const isValid = Math.abs(totalWeight - 100) < 0.01;

  const addWithId = addGradeComponent.bind(null, section.id);

  return (
    <div>
      <PageHeader
        title="Porcentajes de la nota"
        description={`${section.name} · Defina los rubros y qué porcentaje vale cada uno.`}
      />

      <div className="flex items-center gap-2 mb-4" role="tablist" aria-label="Periodo">
        {PERIODS.map((p) => (
          <a
            key={p}
            href={`/secciones/${section.id}/componentes?periodo=${p}`}
            role="tab"
            aria-selected={p === period}
            className={`rounded-lg px-4 py-2 text-base font-semibold border ${
              p === period
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-white text-foreground border-border hover:bg-slate-50"
            }`}
          >
            {PERIOD_LABELS[p]}
          </a>
        ))}
      </div>

      <div
        className={`mb-6 flex items-center gap-3 rounded-xl border px-4 py-3 ${
          isValid
            ? "bg-success-bg border-success-border text-success"
            : "bg-warning-bg border-warning-border text-warning"
        }`}
      >
        {isValid ? <CheckCircle2 size={22} aria-hidden /> : <AlertTriangle size={22} aria-hidden />}
        <p className="font-semibold">
          Suma actual de porcentajes: {totalWeight}%.{" "}
          {isValid ? "¡Correcto!" : "Debe sumar 100% para calcular bien la nota final."}
        </p>
      </div>

      <Card className="divide-y divide-border mb-6">
        {components.map((component) => {
          const updateWithIds = updateGradeComponent.bind(null, section.id, component.id);
          const deleteWithIds = deleteGradeComponent.bind(null, section.id, component.id);
          return (
            <form
              key={component.id}
              action={updateWithIds}
              className="flex flex-col sm:flex-row sm:items-end gap-3 p-4"
            >
              <input type="hidden" name="period" value={period} />
              <div className="flex-1">
                <FormField label="Rubro" htmlFor={`name-${component.id}`}>
                  <Input id={`name-${component.id}`} name="name" defaultValue={component.name} required />
                </FormField>
              </div>
              <div className="w-full sm:w-40">
                <FormField label="Porcentaje" htmlFor={`weight-${component.id}`}>
                  <Input
                    id={`weight-${component.id}`}
                    name="weight"
                    type="number"
                    min={0}
                    max={100}
                    step="0.5"
                    defaultValue={component.weight}
                    required
                  />
                </FormField>
              </div>
              <div className="flex gap-2">
                <Button type="submit" variant="secondary" icon={<Save size={18} aria-hidden />}>
                  Guardar
                </Button>
                <button
                  type="submit"
                  formAction={deleteWithIds}
                  className="inline-flex items-center gap-2 rounded-xl border border-danger-border bg-white px-4 py-2.5 text-base font-semibold text-danger hover:bg-danger-bg"
                >
                  <Trash2 size={18} aria-hidden />
                </button>
              </div>
            </form>
          );
        })}
        {components.length === 0 && (
          <p className="p-6 text-center text-muted-foreground">
            No hay rubros configurados para este periodo.
          </p>
        )}
      </Card>

      <Card className="p-5 max-w-xl">
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <PlusCircle size={22} className="text-primary" aria-hidden />
          Agregar rubro
        </h2>
        <form action={addWithId} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <input type="hidden" name="period" value={period} />
          <div className="sm:col-span-2">
            <FormField label="Nombre" htmlFor="new-name">
              <Input id="new-name" name="name" placeholder="Ej. Proyecto" required />
            </FormField>
          </div>
          <FormField label="Porcentaje" htmlFor="new-weight">
            <Input id="new-weight" name="weight" type="number" min={0} max={100} step="0.5" required />
          </FormField>
          <div className="sm:col-span-3">
            <Button type="submit">Guardar Cambios</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
