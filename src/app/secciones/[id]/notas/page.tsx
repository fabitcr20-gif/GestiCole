import { notFound } from "next/navigation";
import { getCurrentTeacher } from "@/lib/current-teacher";
import { prisma } from "@/lib/prisma";
import { PERIOD_LABELS, PERIODS } from "@/lib/grades";
import { PageHeader } from "@/components/ui/page-header";
import { GradeGrid } from "@/components/grade-grid";

export default async function GradesEntryPage({
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

  const initialScores: Record<string, Record<string, number | null>> = {};
  for (const student of section.students) {
    initialScores[student.id] = {};
  }
  for (const grade of section.grades) {
    if (!initialScores[grade.studentId]) initialScores[grade.studentId] = {};
    initialScores[grade.studentId][grade.componentId] = grade.score;
  }

  return (
    <div>
      <PageHeader
        title="Ingresar Notas"
        description={`${section.name} · ${section.subject} · ${PERIOD_LABELS[period]}`}
      />

      <div className="flex items-center gap-2 mb-6" role="tablist" aria-label="Periodo">
        {PERIODS.map((p) => (
          <a
            key={p}
            href={`/secciones/${section.id}/notas?periodo=${p}`}
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

      <GradeGrid
        sectionId={section.id}
        period={period}
        students={section.students.map((s) => ({
          id: s.id,
          fullName: s.fullName,
          studentCode: s.studentCode,
        }))}
        components={section.gradeComponents.map((c) => ({
          id: c.id,
          name: c.name,
          weight: c.weight,
        }))}
        initialScores={initialScores}
      />
    </div>
  );
}
