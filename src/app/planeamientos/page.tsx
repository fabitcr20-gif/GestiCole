import { PlusCircle, NotebookText, ArrowRight } from "lucide-react";
import { getCurrentTeacher } from "@/lib/current-teacher";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function LessonPlansPage() {
  const teacher = await getCurrentTeacher();
  if (!teacher) return null;

  const plans = await prisma.lessonPlan.findMany({
    where: { teacherId: teacher.id },
    include: { section: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Planeamientos didácticos"
        description="Sus planeamientos de clase."
        actions={
          <ButtonLink href="/planeamientos/nuevo" icon={<PlusCircle size={20} aria-hidden />}>
            Nuevo planeamiento
          </ButtonLink>
        }
      />

      {plans.length === 0 ? (
        <Card className="p-8 text-center">
          <NotebookText className="mx-auto text-muted-foreground" size={40} aria-hidden />
          <p className="mt-3 text-lg text-foreground font-semibold">
            Todavía no tiene planeamientos
          </p>
          <ButtonLink href="/planeamientos/nuevo" className="mt-4 inline-flex">
            Crear planeamiento
          </ButtonLink>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {plans.map((plan) => (
            <a
              key={plan.id}
              href={`/planeamientos/${plan.id}`}
              className="flex items-center justify-between rounded-2xl border border-border bg-surface p-5 shadow-sm hover:border-primary hover:shadow-md transition-all"
            >
              <div>
                <p className="text-lg font-bold text-foreground">{plan.title}</p>
                <p className="text-muted-foreground">
                  {plan.unit ? `${plan.unit} · ` : ""}
                  {plan.section ? `${plan.section.name} · ${plan.section.subject}` : "Sin sección asignada"}
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
