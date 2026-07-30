import { PlusCircle, Users, ArrowRight } from "lucide-react";
import { getCurrentTeacher } from "@/lib/current-teacher";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function SectionsPage() {
  const teacher = await getCurrentTeacher();
  if (!teacher) return null;

  const sections = await prisma.section.findMany({
    where: { teacherId: teacher.id },
    include: { students: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Secciones"
        description="Sus grupos de estudiantes."
        actions={
          <ButtonLink href="/secciones/nueva" icon={<PlusCircle size={20} aria-hidden />}>
            Nueva sección
          </ButtonLink>
        }
      />

      {sections.length === 0 ? (
        <Card className="p-8 text-center">
          <Users className="mx-auto text-muted-foreground" size={40} aria-hidden />
          <p className="mt-3 text-lg text-foreground font-semibold">
            Todavía no tiene secciones
          </p>
          <p className="text-muted-foreground mt-1">
            Cree su primera sección para empezar a llevar el control de notas.
          </p>
          <ButtonLink href="/secciones/nueva" className="mt-4 inline-flex">
            Crear sección
          </ButtonLink>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`/secciones/${section.id}`}
              className="rounded-2xl border border-border bg-surface p-5 shadow-sm hover:border-primary hover:shadow-md transition-all"
            >
              <div
                className="h-2 w-12 rounded-full mb-3"
                style={{ backgroundColor: section.color }}
                aria-hidden
              />
              <p className="text-xl font-bold text-foreground">{section.name}</p>
              <p className="text-muted-foreground">{section.subject}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {section.students.length} estudiante(s)
                </span>
                <ArrowRight className="text-primary" size={20} aria-hidden />
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
