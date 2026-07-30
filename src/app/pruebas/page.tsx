import { PlusCircle, FileText, ArrowRight } from "lucide-react";
import { getCurrentTeacher } from "@/lib/current-teacher";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function ExamsPage() {
  const teacher = await getCurrentTeacher();
  if (!teacher) return null;

  const exams = await prisma.exam.findMany({
    where: { teacherId: teacher.id },
    include: { section: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Pruebas y exámenes"
        description="Sus plantillas de pruebas."
        actions={
          <ButtonLink href="/pruebas/nueva" icon={<PlusCircle size={20} aria-hidden />}>
            Nueva prueba
          </ButtonLink>
        }
      />

      {exams.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="mx-auto text-muted-foreground" size={40} aria-hidden />
          <p className="mt-3 text-lg text-foreground font-semibold">Todavía no tiene pruebas</p>
          <ButtonLink href="/pruebas/nueva" className="mt-4 inline-flex">
            Crear prueba
          </ButtonLink>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {exams.map((exam) => (
            <a
              key={exam.id}
              href={`/pruebas/${exam.id}`}
              className="flex items-center justify-between rounded-2xl border border-border bg-surface p-5 shadow-sm hover:border-primary hover:shadow-md transition-all"
            >
              <div>
                <p className="text-lg font-bold text-foreground">{exam.title}</p>
                <p className="text-muted-foreground">
                  {exam.totalPoints} puntos
                  {exam.section ? ` · ${exam.section.name} · ${exam.section.subject}` : ""}
                </p>
              </div>
              <ArrowRight className="text-primary" size={20} aria-hidden />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
