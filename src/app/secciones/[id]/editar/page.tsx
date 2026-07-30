import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { getCurrentTeacher } from "@/lib/current-teacher";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { SectionForm } from "@/components/section-form";
import { updateSection, deleteSection } from "@/lib/actions/sections";

export default async function EditSectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const teacher = await getCurrentTeacher();
  if (!teacher) return null;

  const section = await prisma.section.findFirst({
    where: { id, teacherId: teacher.id },
  });
  if (!section) notFound();

  const updateWithId = updateSection.bind(null, section.id);
  const deleteWithId = deleteSection.bind(null, section.id);

  return (
    <div>
      <PageHeader title="Editar sección" description={`${section.name} · ${section.subject}`} />
      <SectionForm
        action={updateWithId}
        defaultValues={{
          name: section.name,
          subject: section.subject,
          level: section.level ?? undefined,
          color: section.color,
        }}
      />

      <div className="max-w-xl mt-8 rounded-2xl border border-danger-border bg-danger-bg p-5">
        <p className="text-lg font-bold text-danger">Zona de peligro</p>
        <p className="text-danger mt-1">
          Eliminar esta sección borrará también sus estudiantes, notas, planeamientos y
          pruebas asociadas. Esta acción no se puede deshacer.
        </p>
        <form action={deleteWithId} className="mt-3">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl border border-danger-border bg-white px-4 py-2.5 text-base font-semibold text-danger hover:bg-danger-bg"
          >
            <Trash2 size={18} aria-hidden />
            Eliminar sección
          </button>
        </form>
      </div>
    </div>
  );
}
