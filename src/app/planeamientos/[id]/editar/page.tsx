import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { getCurrentTeacher } from "@/lib/current-teacher";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { LessonPlanForm } from "@/components/lesson-plan-form";
import { updateLessonPlan, deleteLessonPlan } from "@/lib/actions/lesson-plans";

function toDateInput(date: Date | null) {
  if (!date) return undefined;
  return date.toISOString().slice(0, 10);
}

export default async function EditLessonPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const teacher = await getCurrentTeacher();
  if (!teacher) return null;

  const [plan, sections] = await Promise.all([
    prisma.lessonPlan.findFirst({ where: { id, teacherId: teacher.id } }),
    prisma.section.findMany({
      where: { teacherId: teacher.id },
      select: { id: true, name: true, subject: true },
      orderBy: { name: "asc" },
    }),
  ]);
  if (!plan) notFound();

  const updateWithId = updateLessonPlan.bind(null, plan.id);
  const deleteWithId = deleteLessonPlan.bind(null, plan.id);

  return (
    <div>
      <PageHeader title="Editar planeamiento" description={plan.title} />
      <LessonPlanForm
        action={updateWithId}
        sections={sections}
        defaultValues={{
          title: plan.title,
          unit: plan.unit ?? undefined,
          sectionId: plan.sectionId,
          startDate: toDateInput(plan.startDate),
          endDate: toDateInput(plan.endDate),
          objectives: plan.objectives,
          strategies: plan.strategies,
          evaluationCriteria: plan.evaluationCriteria,
          resources: plan.resources ?? undefined,
          notes: plan.notes ?? undefined,
        }}
      />

      <div className="max-w-3xl mt-8 rounded-2xl border border-danger-border bg-danger-bg p-5">
        <p className="text-lg font-bold text-danger">Eliminar planeamiento</p>
        <p className="text-danger mt-1">Esta acción no se puede deshacer.</p>
        <form action={deleteWithId} className="mt-3">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl border border-danger-border bg-white px-4 py-2.5 text-base font-semibold text-danger hover:bg-danger-bg"
          >
            <Trash2 size={18} aria-hidden />
            Eliminar
          </button>
        </form>
      </div>
    </div>
  );
}
