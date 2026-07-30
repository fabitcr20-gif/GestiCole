import { notFound } from "next/navigation";
import { Pencil, Trash2, UserPlus, Upload } from "lucide-react";
import { getCurrentTeacher } from "@/lib/current-teacher";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button, ButtonLink } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/input";
import { addStudent, deleteStudent } from "@/lib/actions/sections";

export default async function StudentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const teacher = await getCurrentTeacher();
  if (!teacher) return null;

  const section = await prisma.section.findFirst({
    where: { id, teacherId: teacher.id },
    include: { students: { orderBy: { order: "asc" } } },
  });
  if (!section) notFound();

  const addWithId = addStudent.bind(null, section.id);

  return (
    <div>
      <PageHeader
        title="Estudiantes"
        description={`${section.name} · ${section.subject}`}
        actions={
          <ButtonLink
            href={`/secciones/${section.id}/importar`}
            variant="secondary"
            icon={<Upload size={18} aria-hidden />}
          >
            Importar lista
          </ButtonLink>
        }
      />

      <Card className="p-5 mb-6">
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <UserPlus size={22} className="text-primary" aria-hidden />
          Agregar estudiante
        </h2>
        <form action={addWithId} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <FormField label="Nombre completo" htmlFor="fullName">
            <Input id="fullName" name="fullName" required placeholder="Nombre Apellido Apellido" />
          </FormField>
          <FormField label="Código (opcional)" htmlFor="studentCode">
            <Input id="studentCode" name="studentCode" placeholder="Carné o cédula" />
          </FormField>
          <FormField label="Correo (opcional)" htmlFor="email">
            <Input id="email" name="email" type="email" placeholder="correo@ejemplo.com" />
          </FormField>
          <div className="sm:col-span-3">
            <Button type="submit">Guardar Cambios</Button>
          </div>
        </form>
      </Card>

      <Card className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-base font-semibold text-foreground">Estudiante</th>
              <th className="px-4 py-3 text-base font-semibold text-foreground">Código</th>
              <th className="px-4 py-3 text-base font-semibold text-foreground">Correo</th>
              <th className="px-4 py-3 text-base font-semibold text-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {section.students.map((student) => {
              const deleteWithIds = deleteStudent.bind(null, section.id, student.id);
              return (
                <tr key={student.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-lg text-foreground">{student.fullName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{student.studentCode ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{student.email ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <ButtonLink
                        href={`/secciones/${section.id}/estudiantes/${student.id}/editar`}
                        variant="secondary"
                        size="md"
                        icon={<Pencil size={16} aria-hidden />}
                        className="!px-3 !py-2 text-sm"
                      >
                        Editar
                      </ButtonLink>
                      <form action={deleteWithIds}>
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-danger-border bg-white px-3 py-2 text-sm font-semibold text-danger hover:bg-danger-bg"
                        >
                          <Trash2 size={16} aria-hidden />
                          Eliminar
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
            {section.students.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  Todavía no hay estudiantes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
