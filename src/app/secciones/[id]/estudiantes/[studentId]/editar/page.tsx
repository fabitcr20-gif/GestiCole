import { notFound } from "next/navigation";
import { getCurrentTeacher } from "@/lib/current-teacher";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/input";
import { updateStudent } from "@/lib/actions/sections";
import { Save } from "lucide-react";

export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string; studentId: string }>;
}) {
  const { id, studentId } = await params;
  const teacher = await getCurrentTeacher();
  if (!teacher) return null;

  const section = await prisma.section.findFirst({
    where: { id, teacherId: teacher.id },
  });
  if (!section) notFound();

  const student = await prisma.student.findFirst({
    where: { id: studentId, sectionId: section.id },
  });
  if (!student) notFound();

  const updateWithIds = updateStudent.bind(null, section.id, student.id);

  return (
    <div>
      <PageHeader title="Editar estudiante" description={section.name} />
      <Card className="p-6 max-w-xl">
        <form action={updateWithIds} className="flex flex-col gap-5">
          <FormField label="Nombre completo" htmlFor="fullName">
            <Input id="fullName" name="fullName" required defaultValue={student.fullName} />
          </FormField>
          <FormField label="Código (opcional)" htmlFor="studentCode">
            <Input id="studentCode" name="studentCode" defaultValue={student.studentCode ?? ""} />
          </FormField>
          <FormField label="Correo (opcional)" htmlFor="email">
            <Input id="email" name="email" type="email" defaultValue={student.email ?? ""} />
          </FormField>
          <Button type="submit" size="lg" icon={<Save size={22} aria-hidden />}>
            Guardar Cambios
          </Button>
        </form>
      </Card>
    </div>
  );
}
