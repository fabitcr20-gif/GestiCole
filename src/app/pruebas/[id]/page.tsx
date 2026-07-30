import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { getCurrentTeacher } from "@/lib/current-teacher";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { PrintButton } from "@/components/print-button";
import { DriveBackupButton } from "@/components/drive-backup-button";
import type { Question } from "@/components/exam-questions-editor";

export default async function ExamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const teacher = await getCurrentTeacher();
  if (!teacher) return null;

  const exam = await prisma.exam.findFirst({
    where: { id, teacherId: teacher.id },
    include: { section: true },
  });
  if (!exam) notFound();

  const questions = (exam.questions as unknown as Question[]) ?? [];

  return (
    <div>
      <PageHeader
        title={exam.title}
        description={exam.section ? `${exam.section.name} · ${exam.section.subject}` : undefined}
        actions={
          <>
            <PrintButton />
            <DriveBackupButton type="exam" id={exam.id} />
            <ButtonLink
              href={`/pruebas/${exam.id}/editar`}
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
        <div className="mb-6 border-b border-border pb-4">
          <div className="grid grid-cols-2 gap-4 text-muted-foreground">
            <p>Nombre: ______________________________</p>
            <p>Fecha: ____________</p>
          </div>
          <p className="mt-2 font-bold text-foreground">Puntaje total: {exam.totalPoints} puntos</p>
          {exam.instructions && <p className="mt-2 text-foreground">{exam.instructions}</p>}
        </div>

        <ol className="flex flex-col gap-6 list-decimal list-inside">
          {questions.map((q, i) => (
            <li key={i} className="text-foreground">
              <span className="font-semibold">{q.prompt}</span>{" "}
              <span className="text-muted-foreground">({q.points} pts)</span>
              {q.type === "seleccion" && q.options && (
                <ul className="mt-2 ml-6 list-[lower-alpha] list-inside flex flex-col gap-1">
                  {q.options.map((opt, oi) => (
                    <li key={oi}>{opt}</li>
                  ))}
                </ul>
              )}
              {q.type === "corta" && (
                <p className="mt-2 ml-2 border-b border-dashed border-border pb-4">
                  Respuesta: ___________________________________
                </p>
              )}
              {q.type === "desarrollo" && (
                <div className="mt-2 ml-2 h-16 border-b border-dashed border-border" />
              )}
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
