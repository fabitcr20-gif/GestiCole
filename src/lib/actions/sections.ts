"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentTeacher } from "@/lib/current-teacher";

const sectionSchema = z.object({
  name: z.string().trim().min(1, "El nombre de la sección es obligatorio"),
  subject: z.string().trim().min(1, "La materia es obligatoria"),
  level: z.string().trim().optional(),
  color: z.string().trim().default("#2563eb"),
});

async function requireTeacher() {
  const teacher = await getCurrentTeacher();
  if (!teacher) throw new Error("No hay una sesión activa");
  return teacher;
}

export async function createSection(formData: FormData) {
  const teacher = await requireTeacher();
  const parsed = sectionSchema.parse({
    name: formData.get("name"),
    subject: formData.get("subject"),
    level: formData.get("level") || undefined,
    color: formData.get("color") || "#2563eb",
  });

  const section = await prisma.section.create({
    data: {
      teacherId: teacher.id,
      ...parsed,
      gradeComponents: {
        create: [
          { name: "Cotidiano", weight: 20, period: "I", order: 0 },
          { name: "Tareas", weight: 15, period: "I", order: 1 },
          { name: "Pruebas", weight: 45, period: "I", order: 2 },
          { name: "Proyecto", weight: 15, period: "I", order: 3 },
          { name: "Asistencia", weight: 5, period: "I", order: 4 },
        ],
      },
    },
  });

  revalidatePath("/secciones");
  redirect(`/secciones/${section.id}`);
}

export async function updateSection(sectionId: string, formData: FormData) {
  const teacher = await requireTeacher();
  const parsed = sectionSchema.parse({
    name: formData.get("name"),
    subject: formData.get("subject"),
    level: formData.get("level") || undefined,
    color: formData.get("color") || "#2563eb",
  });

  await prisma.section.updateMany({
    where: { id: sectionId, teacherId: teacher.id },
    data: parsed,
  });

  revalidatePath("/secciones");
  revalidatePath(`/secciones/${sectionId}`);
  redirect(`/secciones/${sectionId}`);
}

export async function deleteSection(sectionId: string) {
  const teacher = await requireTeacher();
  await prisma.section.deleteMany({
    where: { id: sectionId, teacherId: teacher.id },
  });
  revalidatePath("/secciones");
  redirect("/secciones");
}

const studentSchema = z.object({
  fullName: z.string().trim().min(1, "El nombre es obligatorio"),
  studentCode: z.string().trim().optional(),
  email: z.string().trim().email("Correo inválido").optional().or(z.literal("")),
});

export async function addStudent(sectionId: string, formData: FormData) {
  const teacher = await requireTeacher();
  const section = await prisma.section.findFirst({
    where: { id: sectionId, teacherId: teacher.id },
  });
  if (!section) throw new Error("Sección no encontrada");

  const parsed = studentSchema.parse({
    fullName: formData.get("fullName"),
    studentCode: formData.get("studentCode") || undefined,
    email: formData.get("email") || undefined,
  });

  const count = await prisma.student.count({ where: { sectionId } });

  await prisma.student.create({
    data: {
      sectionId,
      fullName: parsed.fullName,
      studentCode: parsed.studentCode || null,
      email: parsed.email || null,
      order: count,
    },
  });

  revalidatePath(`/secciones/${sectionId}`);
  revalidatePath(`/secciones/${sectionId}/estudiantes`);
}

export async function updateStudent(
  sectionId: string,
  studentId: string,
  formData: FormData
) {
  const teacher = await requireTeacher();
  const section = await prisma.section.findFirst({
    where: { id: sectionId, teacherId: teacher.id },
  });
  if (!section) throw new Error("Sección no encontrada");

  const parsed = studentSchema.parse({
    fullName: formData.get("fullName"),
    studentCode: formData.get("studentCode") || undefined,
    email: formData.get("email") || undefined,
  });

  await prisma.student.update({
    where: { id: studentId },
    data: {
      fullName: parsed.fullName,
      studentCode: parsed.studentCode || null,
      email: parsed.email || null,
    },
  });

  revalidatePath(`/secciones/${sectionId}`);
  revalidatePath(`/secciones/${sectionId}/estudiantes`);
}

export async function deleteStudent(sectionId: string, studentId: string) {
  const teacher = await requireTeacher();
  const section = await prisma.section.findFirst({
    where: { id: sectionId, teacherId: teacher.id },
  });
  if (!section) throw new Error("Sección no encontrada");

  await prisma.student.delete({ where: { id: studentId } });

  revalidatePath(`/secciones/${sectionId}`);
  revalidatePath(`/secciones/${sectionId}/estudiantes`);
}
