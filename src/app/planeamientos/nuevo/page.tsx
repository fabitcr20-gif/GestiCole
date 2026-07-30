import { getCurrentTeacher } from "@/lib/current-teacher";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { LessonPlanForm } from "@/components/lesson-plan-form";
import { createLessonPlan } from "@/lib/actions/lesson-plans";

export default async function NewLessonPlanPage() {
  const teacher = await getCurrentTeacher();
  if (!teacher) return null;

  const sections = await prisma.section.findMany({
    where: { teacherId: teacher.id },
    select: { id: true, name: true, subject: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Nuevo planeamiento"
        description="Complete los campos básicos de su planeamiento didáctico."
      />
      <LessonPlanForm action={createLessonPlan} sections={sections} />
    </div>
  );
}
