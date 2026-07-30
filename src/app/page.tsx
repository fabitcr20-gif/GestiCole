import { Users, NotebookText, FileText, PlusCircle, ClipboardList } from "lucide-react";
import { getCurrentTeacher } from "@/lib/current-teacher";
import { prisma } from "@/lib/prisma";
import { computeWeightedAverage } from "@/lib/grades";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

export default async function DashboardPage() {
  const teacher = await getCurrentTeacher();
  if (!teacher) return null;

  const sections = await prisma.section.findMany({
    where: { teacherId: teacher.id },
    include: {
      students: true,
      gradeComponents: true,
      grades: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const totalStudents = sections.reduce((sum, s) => sum + s.students.length, 0);

  let sumAverages = 0;
  let countAverages = 0;
  for (const section of sections) {
    for (const student of section.students) {
      const scores = new Map(
        section.grades
          .filter((g) => g.studentId === student.id)
          .map((g) => [g.componentId, g.score])
      );
      const { average } = computeWeightedAverage(section.gradeComponents, scores);
      if (average !== null) {
        sumAverages += average;
        countAverages += 1;
      }
    }
  }
  const generalAverage = countAverages > 0 ? sumAverages / countAverages : null;

  return (
    <div>
      <PageHeader
        title={`Hola, ${teacher.name?.split(" ")[0] ?? "profesor(a)"}`}
        description="Este es el resumen de su trabajo. Elija qué desea hacer."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Secciones" value={sections.length} icon={Users} />
        <StatCard label="Estudiantes" value={totalStudents} icon={ClipboardList} />
        <StatCard
          label="Promedio general"
          value={generalAverage !== null ? generalAverage.toFixed(1) : "—"}
          icon={NotebookText}
        />
      </div>

      <h2 className="text-xl font-bold text-foreground mb-3">¿Qué desea hacer?</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <ActionCard
          href="/secciones/nueva"
          icon={PlusCircle}
          title="Crear una sección nueva"
          description="Agregue un grupo de estudiantes y comience a llevar sus notas."
        />
        <ActionCard
          href="/secciones"
          icon={Users}
          title="Ingresar notas"
          description="Vaya a una sección para capturar o revisar calificaciones."
        />
        <ActionCard
          href="/planeamientos/nuevo"
          icon={NotebookText}
          title="Nuevo planeamiento"
          description="Cree un planeamiento didáctico rápido para su próxima clase."
        />
        <ActionCard
          href="/pruebas/nueva"
          icon={FileText}
          title="Nueva prueba"
          description="Genere una prueba lista para imprimir."
        />
      </div>

      {sections.length > 0 && (
        <>
          <h2 className="text-xl font-bold text-foreground mb-3">Sus secciones</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sections.slice(0, 4).map((section) => (
              <Card key={section.id} className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-foreground">
                    {section.name} · {section.subject}
                  </p>
                  <p className="text-muted-foreground">
                    {section.students.length} estudiante(s)
                  </p>
                </div>
                <ButtonLink href={`/secciones/${section.id}`} variant="secondary">
                  Ver
                </ButtonLink>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: typeof Users;
}) {
  return (
    <Card className="p-5 flex items-center gap-4">
      <div className="rounded-xl bg-primary/10 p-3">
        <Icon className="text-primary" size={28} aria-hidden />
      </div>
      <div>
        <p className="text-3xl font-bold text-foreground">{value}</p>
        <p className="text-muted-foreground">{label}</p>
      </div>
    </Card>
  );
}

function ActionCard({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: typeof Users;
  title: string;
  description: string;
}) {
  return (
    <a
      href={href}
      className="flex items-start gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm hover:border-primary hover:shadow-md transition-all"
    >
      <div className="rounded-xl bg-primary/10 p-3 shrink-0">
        <Icon className="text-primary" size={28} aria-hidden />
      </div>
      <div>
        <p className="text-lg font-bold text-foreground">{title}</p>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </a>
  );
}
