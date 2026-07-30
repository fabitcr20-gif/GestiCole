"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentTeacher } from "@/lib/current-teacher";

const questionSchema = z.object({
  type: z.enum(["desarrollo", "seleccion", "corta"]),
  prompt: z.string().trim().min(1),
  points: z.coerce.number().min(0),
  options: z.array(z.string()).optional(),
});

const examSchema = z.object({
  title: z.string().trim().min(1, "El título es obligatorio"),
  subject: z.string().trim().optional(),
  sectionId: z.string().trim().optional(),
  instructions: z.string().trim().optional(),
  questions: z.array(questionSchema).min(1, "Agregue al menos una pregunta"),
});

function parseForm(formData: FormData) {
  const questionsRaw = formData.get("questionsJson");
  let questions: unknown = [];
  try {
    questions = JSON.parse((questionsRaw as string) || "[]");
  } catch {
    questions = [];
  }

  return examSchema.parse({
    title: formData.get("title"),
    subject: formData.get("subject") || undefined,
    sectionId: formData.get("sectionId") || undefined,
    instructions: formData.get("instructions") || undefined,
    questions,
  });
}

export async function createExam(formData: FormData) {
  const teacher = await getCurrentTeacher();
  if (!teacher) throw new Error("No hay una sesión activa");
  const parsed = parseForm(formData);
  const totalPoints = parsed.questions.reduce((sum, q) => sum + q.points, 0);

  const exam = await prisma.exam.create({
    data: {
      teacherId: teacher.id,
      title: parsed.title,
      subject: parsed.subject || null,
      sectionId: parsed.sectionId || null,
      instructions: parsed.instructions || null,
      totalPoints,
      questions: parsed.questions,
    },
  });

  revalidatePath("/pruebas");
  redirect(`/pruebas/${exam.id}`);
}

export async function updateExam(examId: string, formData: FormData) {
  const teacher = await getCurrentTeacher();
  if (!teacher) throw new Error("No hay una sesión activa");
  const parsed = parseForm(formData);
  const totalPoints = parsed.questions.reduce((sum, q) => sum + q.points, 0);

  await prisma.exam.updateMany({
    where: { id: examId, teacherId: teacher.id },
    data: {
      title: parsed.title,
      subject: parsed.subject || null,
      sectionId: parsed.sectionId || null,
      instructions: parsed.instructions || null,
      totalPoints,
      questions: parsed.questions,
    },
  });

  revalidatePath("/pruebas");
  revalidatePath(`/pruebas/${examId}`);
  redirect(`/pruebas/${examId}`);
}

export async function deleteExam(examId: string) {
  const teacher = await getCurrentTeacher();
  if (!teacher) throw new Error("No hay una sesión activa");
  await prisma.exam.deleteMany({ where: { id: examId, teacherId: teacher.id } });
  revalidatePath("/pruebas");
  redirect("/pruebas");
}
