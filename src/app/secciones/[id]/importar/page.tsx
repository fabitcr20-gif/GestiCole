import { notFound } from "next/navigation";
import { getCurrentTeacher } from "@/lib/current-teacher";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { ImportWizard } from "@/components/import-wizard";

export default async function ImportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const teacher = await getCurrentTeacher();
  if (!teacher) return null;

  const section = await prisma.section.findFirst({
    where: { id, teacherId: teacher.id },
    include: { gradeComponents: { orderBy: { order: "asc" } } },
  });
  if (!section) notFound();

  return (
    <div>
      <PageHeader
        title="Importar lista de estudiantes"
        description={`${section.name} · ${section.subject}`}
      />
      <ImportWizard
        sectionId={section.id}
        gradeComponents={section.gradeComponents.map((c) => ({
          id: c.id,
          name: c.name,
          period: c.period,
        }))}
      />
    </div>
  );
}
