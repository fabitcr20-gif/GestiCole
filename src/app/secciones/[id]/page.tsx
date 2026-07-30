import { notFound } from "next/navigation";
import {
  NotebookText,
  SlidersHorizontal,
  Users,
  Upload,
  Download,
  Pencil,
} from "lucide-react";
import { getCurrentTeacher } from "@/lib/current-teacher";
import { prisma } from "@/lib/prisma";
import { computeWeightedAverage, PERIOD_LABELS, PERIODS } from "@/lib/grades";
import { PageHeader } from "@/components/ui/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GradeBadge } from "@/components/ui/grade-badge";

export default async function SectionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ periodo?: string }>;
}) {
  const { id } = await params;
  const { periodo } = await searchParams;
  const period = periodo && PERIODS.includes(periodo as (typeof PERIODS)[number]) ? periodo : "I";

  const teacher = await getCurrentTeacher();
  if (!teacher) return null;

  const section = await prisma.section.findFirst({
    where: { id, teacherId: teacher.id },
    include: {
      students: { orderBy: { order: "asc" } },
      gradeComponents: { where: { period }, orderBy: { order: "asc" } },
      grades: { where: { component: { period } } },
    },
  });

  if (!section) notFound();

  const results = section.students.map((student) => {
    const scores = new Map(
      section.grades
        .filter((g) => g.studentId === student.id)
        .map((g) => [g.componentId, g.score])
    );
    return { student, ...computeWeightedAverage(section.gradeComponents, scores) };
  });

  const approved = results.filter((r) => r.average !== null && r.average >= 70).length;
  const failing = results.filter((r) => r.average !== null && r.average < 70).length;

  return (
    <div>
      <PageHeader
        title={`${section.name} · ${section.subject}`}
        description={section.level ?? undefined}
        actions={
          <ButtonLink href={`/secciones/${section.id}/editar`} variant="secondary" icon={<Pencil size={18} aria-hidden />}>
            Editar
          </ButtonLink>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <ActionLink href={`/secciones/${section.id}/notas?periodo=${period}`} icon={NotebookText} label="Ingresar Notas" />
        <ActionLink href={`/secciones/${section.id}/componentes?periodo=${period}`} icon={SlidersHorizontal} label="Porcentajes" />
        <ActionLink href={`/secciones/${section.id}/estudiantes`} icon={Users} label="Estudiantes" />
        <ActionLink href={`/secciones/${section.id}/importar`} icon={Upload} label="Importar" />
        <ActionLink href={`/secciones/${section.id}/exportar?periodo=${period}`} icon={Download} label="Exportar" />
      </div>

      <div className="flex items-center gap-2 mb-4" role="tablist" aria-label="Periodo">
        {PERIODS.map((p) => (
          <a
            key={p}
            href={`/secciones/${section.id}?periodo=${p}`}
            role="tab"
            aria-selected={p === period}
            className={`rounded-lg px-4 py-2 text-base font-semibold border ${
              p === period
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-white text-foreground border-border hover:bg-slate-50"
            }`}
          >
            {PERIOD_LABELS[p]}
          </a>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-2xl font-bold text-foreground">{section.students.length}</p>
          <p className="text-muted-foreground">Estudiantes</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-success">{approved}</p>
          <p className="text-muted-foreground">Aprobados</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-danger">{failing}</p>
          <p className="text-muted-foreground">Reprobados</p>
        </Card>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-base font-semibold text-foreground">Estudiante</th>
              <th className="px-4 py-3 text-base font-semibold text-foreground">Código</th>
              <th className="px-4 py-3 text-base font-semibold text-foreground">Promedio</th>
            </tr>
          </thead>
          <tbody>
            {results.map(({ student, average, isComplete }) => (
              <tr key={student.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-lg text-foreground">{student.fullName}</td>
                <td className="px-4 py-3 text-muted-foreground">{student.studentCode ?? "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <GradeBadge score={average} />
                    {!isComplete && average !== null && (
                      <span className="text-xs text-muted-foreground">en curso</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {results.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                  No hay estudiantes en esta sección todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function ActionLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof NotebookText;
  label: string;
}) {
  return (
    <a
      href={href}
      className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface px-3 py-4 text-center shadow-sm hover:border-primary hover:shadow-md transition-all"
    >
      <Icon className="text-primary" size={26} aria-hidden />
      <span className="text-sm font-semibold text-foreground">{label}</span>
    </a>
  );
}
