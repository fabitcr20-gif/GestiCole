import { notFound } from "next/navigation";
import { Pencil, FileDown } from "lucide-react";
import { getCurrentTeacher } from "@/lib/current-teacher";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { PrintButton } from "@/components/print-button";
import { DriveBackupButton } from "@/components/drive-backup-button";
import { GoogleDocsExportButton } from "@/components/google-docs-export-button";
import { AnexoATemplate } from "@/components/anexo-a-template";

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
            <ButtonLink
              href={`/api/lesson-plans/${plan.id}/export`}
              variant="secondary"
              icon={<FileDown size={18} aria-hidden />}
              className="print:hidden"
            >
              PDF oficial MEP
            </ButtonLink>
            <DriveBackupButton type="lessonPlan" id={plan.id} />
            <GoogleDocsExportButton lessonPlanId={plan.id} />
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

      <Card className="p-8 max-w-4xl print:shadow-none print:border-none">
        <AnexoATemplate
          plan={{
            title: plan.title,
            unit: plan.unit,
            startDate: plan.startDate,
            endDate: plan.endDate,
            direccionRegional: plan.direccionRegional,
            centroEducativo: plan.centroEducativo,
            docente: teacher.name,
            asignatura: plan.asignatura ?? plan.section?.subject,
            nivelCiclo: plan.nivelCiclo,
            periodicidad: plan.periodicidad,
            cursoLectivo: plan.cursoLectivo,
            competencias: plan.competencias,
            institutionalContext: plan.institutionalContext,
            socialContext: plan.socialContext,
            groupCharacteristics: plan.groupCharacteristics,
            learningStyles: plan.learningStyles,
            duaSupports: (plan.duaSupports as string[] | null) ?? [],
            specialEducationNeeds: plan.specialEducationNeeds,
            pedagogicalApproach: plan.pedagogicalApproach,
            objectives: plan.objectives,
            strategies: plan.strategies,
            evaluationCriteria: plan.evaluationCriteria,
            resources: plan.resources,
            reflection: plan.reflection,
            notes: plan.notes,
          }}
        />
      </Card>
    </div>
  );
}
