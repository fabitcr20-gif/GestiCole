import { getCurrentTeacher } from "@/lib/current-teacher";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { MepPlanWizard } from "@/components/mep-plan-wizard";
import { isClaudeConfigured } from "@/lib/mep/generate-plan";

export default async function NewLessonPlanPage() {
  const teacher = await getCurrentTeacher();
  if (!teacher) return null;

  const sections = await prisma.section.findMany({
    where: { teacherId: teacher.id },
    select: { id: true, name: true, subject: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Nuevo planeamiento didáctico con IA"
        description="Complete el contexto de su clase y genere un planeamiento alineado a la Plantilla Oficial Anexo A del MEP."
      />
      <MepPlanWizard sections={sections} claudeConfigured={isClaudeConfigured} />
    </div>
  );
}
