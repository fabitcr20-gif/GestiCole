import { getCurrentTeacher } from "@/lib/current-teacher";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { ExamForm } from "@/components/exam-form";
import { createExam } from "@/lib/actions/exams";

export default async function NewExamPage() {
  const teacher = await getCurrentTeacher();
  if (!teacher) return null;

  const sections = await prisma.section.findMany({
    where: { teacherId: teacher.id },
    select: { id: true, name: true, subject: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader title="Nueva prueba" description="Cree una prueba lista para imprimir." />
      <ExamForm action={createExam} sections={sections} />
    </div>
  );
}
