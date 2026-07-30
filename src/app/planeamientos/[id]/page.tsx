import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { getCurrentTeacher } from "@/lib/current-teacher";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { PrintButton } from "@/components/print-button";
import { DriveBackupButton } from "@/components/drive-backup-button";

export default async function LessonPlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const teacher = await getCurrentTeacher();
  if (!teacher) return null;

  const plan = await prisma.lessonPlan.findFirst({
    where: { id, teacherId: teacher.id },
    include: { section: true },
  });
  if (!plan) notFound();

  return (
    <div>
      <PageHeader
        title={plan.title}
        description={
          plan.section ? `${plan.section.name} · ${plan.section.subject}` : undefined
        }
        actions={
          <>
            <PrintButton />
            <DriveBackupButton type="lessonPlan" id={plan.id} />
            <ButtonLink
              href={`/planeamientos/${plan.id}/editar`}
              variant="secondary"
              icon={<Pencil size={18} aria-hidden />}
              className="print:hidden"
            >
              Editar
            </ButtonLink>
          </>
        }
      />

      <Card className="p-8 max-w-3xl print:shadow-none print:border-none">
        {(plan.unit || plan.startDate || plan.endDate) && (
          <div className="mb-6 text-muted-foreground">
            {plan.unit && <p><strong className="text-foreground">Unidad:</strong> {plan.unit}</p>}
            {(plan.startDate || plan.endDate) && (
              <p>
                <strong className="text-foreground">Fechas:</strong>{" "}
                {plan.startDate?.toLocaleDateString("es-CR") ?? "—"} al{" "}
                {plan.endDate?.toLocaleDateString("es-CR") ?? "—"}
              </p>
            )}
          </div>
        )}

        <Section title="Objetivos de aprendizaje" content={plan.objectives} />
        <Section title="Estrategias de mediación" content={plan.strategies} />
        <Section title="Criterios de evaluación" content={plan.evaluationCriteria} />
        {plan.resources && <Section title="Recursos y materiales" content={plan.resources} />}
        {plan.notes && <Section title="Notas adicionales" content={plan.notes} />}
      </Card>
    </div>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <div className="mb-6 last:mb-0">
      <h2 className="text-lg font-bold text-foreground mb-1">{title}</h2>
      <p className="text-foreground whitespace-pre-wrap">{content}</p>
    </div>
  );
}
