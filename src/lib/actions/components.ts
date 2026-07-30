"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentTeacher } from "@/lib/current-teacher";

async function requireSectionAccess(sectionId: string) {
  const teacher = await getCurrentTeacher();
  if (!teacher) throw new Error("No hay una sesión activa");
  const section = await prisma.section.findFirst({
    where: { id: sectionId, teacherId: teacher.id },
  });
  if (!section) throw new Error("Sección no encontrada");
  return section;
}

const componentSchema = z.object({
  name: z.string().trim().min(1, "El nombre del rubro es obligatorio"),
  weight: z.coerce.number().min(0, "El porcentaje no puede ser negativo").max(100),
  period: z.string().trim().min(1),
});

export async function addGradeComponent(sectionId: string, formData: FormData) {
  const section = await requireSectionAccess(sectionId);
  const parsed = componentSchema.parse({
    name: formData.get("name"),
    weight: formData.get("weight"),
    period: formData.get("period"),
  });

  const count = await prisma.gradeComponent.count({
    where: { sectionId: section.id, period: parsed.period },
  });

  await prisma.gradeComponent.create({
    data: { sectionId: section.id, ...parsed, order: count },
  });

  revalidatePath(`/secciones/${sectionId}/componentes`);
  revalidatePath(`/secciones/${sectionId}/notas`);
  revalidatePath(`/secciones/${sectionId}`);
}

export async function updateGradeComponent(
  sectionId: string,
  componentId: string,
  formData: FormData
) {
  const section = await requireSectionAccess(sectionId);
  const parsed = componentSchema.parse({
    name: formData.get("name"),
    weight: formData.get("weight"),
    period: formData.get("period"),
  });

  await prisma.gradeComponent.updateMany({
    where: { id: componentId, sectionId: section.id },
    data: { name: parsed.name, weight: parsed.weight },
  });

  revalidatePath(`/secciones/${sectionId}/componentes`);
  revalidatePath(`/secciones/${sectionId}/notas`);
  revalidatePath(`/secciones/${sectionId}`);
}

export async function deleteGradeComponent(sectionId: string, componentId: string) {
  const section = await requireSectionAccess(sectionId);
  await prisma.gradeComponent.deleteMany({
    where: { id: componentId, sectionId: section.id },
  });

  revalidatePath(`/secciones/${sectionId}/componentes`);
  revalidatePath(`/secciones/${sectionId}/notas`);
  revalidatePath(`/secciones/${sectionId}`);
}
