import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { getCurrentTeacher } from "@/lib/current-teacher";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { ExamForm } from "@/components/exam-form";
import { updateExam, deleteExam } from "@/lib/actions/exams";
import type { Question } from "@/components/exam-questions-editor";

export default async function EditExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const teacher = await getCurrentTeacher();
  if (!teacher) return null;

  const [exam, sections] = await Promise.all([
    prisma.exam.findFirst({ where: { id, teacherId: teacher.id } }),
    prisma.section.findMany({
      where: { teacherId: teacher.id },
      select: { id: true, name: true, subject: true },
      orderBy: { name: "asc" },
    }),
  ]);
  if (!exam) notFound();

  const updateWithId = updateExam.bind(null, exam.id);
  const deleteWithId = deleteExam.bind(null, exam.id);

  return (
    <div>
      <PageHeader title="Editar prueba" description={exam.title} />
      <ExamForm
        action={updateWithId}
        sections={sections}
        defaultValues={{
          title: exam.title,
          subject: exam.subject ?? undefined,
          sectionId: exam.sectionId,
          instructions: exam.instructions ?? undefined,
          questions: (exam.questions as unknown as Question[]) ?? [],
        }}
      />

      <div className="max-w-3xl mt-8 rounded-2xl border border-danger-border bg-danger-bg p-5">
        <p className="text-lg font-bold text-danger">Eliminar prueba</p>
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
