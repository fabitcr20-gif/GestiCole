import { Users, NotebookText, FileText, PlusCircle, ClipboardList, BarChart3, PieChart } from "lucide-react";
import { getCurrentTeacher } from "@/lib/current-teacher";
import { prisma } from "@/lib/prisma";
import { computeWeightedAverage } from "@/lib/grades";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { HorizontalBarChart, type BarDatum } from "@/components/charts/horizontal-bar-chart";
import { StatusStackedBar } from "@/components/charts/status-stacked-bar";
import { PASSING_SCORE } from "@/components/ui/grade-badge";

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
  let aprobados = 0;
  let reprobados = 0;
  let sinCalificar = 0;

  const studentsBySection: BarDatum[] = [];
  const averageBySection: BarDatum[] = [];

  for (const section of sections) {
    let sectionSum = 0;
    let sectionCount = 0;

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
        sectionSum += average;
        sectionCount += 1;
        if (average >= PASSING_SCORE) aprobados += 1;
        else reprobados += 1;
      } else {
        sinCalificar += 1;
      }
    }

    studentsBySection.push({
      id: section.id,
      label: section.name,
      value: section.students.length,
      color: section.color,
    });

    if (sectionCount > 0) {
      const sectionAverage = sectionSum / sectionCount;
      averageBySection.push({
        id: section.id,
        label: section.name,
        value: sectionAverage,
        color: sectionAverage >= PASSING_SCORE ? "var(--color-success)" : "var(--color-danger)",
        hint: sectionAverage >= PASSING_SCORE ? "aprobado" : "reprobado",
      });
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

      {sections.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <Card className="p-5">
            <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
              <BarChart3 className="text-primary" size={20} aria-hidden />
              Estudiantes por sección
            </h2>
            <p className="text-muted-foreground mb-4 text-sm">
              Cuántos estudiantes tiene cada grupo.
            </p>
            <HorizontalBarChart data={studentsBySection} format="integer" />
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
              <BarChart3 className="text-primary" size={20} aria-hidden />
              Promedio por sección
            </h2>
            <p className="text-muted-foreground mb-4 text-sm">
              Verde = aprobado, rojo = reprobado (nota mínima {PASSING_SCORE}).
            </p>
            <HorizontalBarChart
              data={averageBySection}
              maxValue={100}
              referenceLine={PASSING_SCORE}
              referenceLabel={`Mínimo ${PASSING_SCORE}`}
              emptyMessage="Todavía no hay notas registradas."
            />
          </Card>

          <Card className="p-5 lg:col-span-2">
            <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
              <PieChart className="text-primary" size={20} aria-hidden />
              Estado general de los estudiantes
            </h2>
            <p className="text-muted-foreground mb-4 text-sm">
              Sobre el total de {totalStudents} estudiante(s) en todas sus secciones.
            </p>
            <StatusStackedBar
              segments={[
                {
                  id: "aprobados",
                  label: "Aprobados",
                  value: aprobados,
                  color: "var(--color-success)",
                  textColor: "#ffffff",
                },
                {
                  id: "reprobados",
                  label: "Reprobados",
                  value: reprobados,
                  color: "var(--color-danger)",
                  textColor: "#ffffff",
                },
                {
                  id: "sin-calificar",
                  label: "Sin calificar",
                  value: sinCalificar,
                  color: "var(--muted-foreground)",
                  textColor: "#ffffff",
                },
              ]}
            />
          </Card>
        </div>
      )}

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
