"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentTeacher } from "@/lib/current-teacher";

const lessonPlanSchema = z.object({
  title: z.string().trim().min(1, "El título es obligatorio"),
  unit: z.string().trim().optional(),
  sectionId: z.string().trim().optional(),
  startDate: z.string().trim().optional(),
  endDate: z.string().trim().optional(),
  objectives: z.string().trim().min(1, "Los objetivos son obligatorios"),
  strategies: z.string().trim().min(1, "Las estrategias de mediación son obligatorias"),
  evaluationCriteria: z.string().trim().min(1, "Los criterios de evaluación son obligatorios"),
  resources: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

function parseForm(formData: FormData) {
  return lessonPlanSchema.parse({
    title: formData.get("title"),
    unit: formData.get("unit") || undefined,
    sectionId: formData.get("sectionId") || undefined,
    startDate: formData.get("startDate") || undefined,
    endDate: formData.get("endDate") || undefined,
    objectives: formData.get("objectives"),
    strategies: formData.get("strategies"),
    evaluationCriteria: formData.get("evaluationCriteria"),
    resources: formData.get("resources") || undefined,
    notes: formData.get("notes") || undefined,
  });
}

export async function createLessonPlan(formData: FormData) {
  const teacher = await getCurrentTeacher();
  if (!teacher) throw new Error("No hay una sesión activa");
  const parsed = parseForm(formData);

  const plan = await prisma.lessonPlan.create({
    data: {
      teacherId: teacher.id,
      title: parsed.title,
      unit: parsed.unit || null,
      sectionId: parsed.sectionId || null,
      startDate: parsed.startDate ? new Date(parsed.startDate) : null,
      endDate: parsed.endDate ? new Date(parsed.endDate) : null,
      objectives: parsed.objectives,
      strategies: parsed.strategies,
      evaluationCriteria: parsed.evaluationCriteria,
      resources: parsed.resources || null,
      notes: parsed.notes || null,
    },
  });

  revalidatePath("/planeamientos");
  redirect(`/planeamientos/${plan.id}`);
}

export async function updateLessonPlan(planId: string, formData: FormData) {
  const teacher = await getCurrentTeacher();
  if (!teacher) throw new Error("No hay una sesión activa");
  const parsed = parseForm(formData);

  await prisma.lessonPlan.updateMany({
    where: { id: planId, teacherId: teacher.id },
    data: {
      title: parsed.title,
      unit: parsed.unit || null,
      sectionId: parsed.sectionId || null,
      startDate: parsed.startDate ? new Date(parsed.startDate) : null,
      endDate: parsed.endDate ? new Date(parsed.endDate) : null,
      objectives: parsed.objectives,
      strategies: parsed.strategies,
      evaluationCriteria: parsed.evaluationCriteria,
      resources: parsed.resources || null,
      notes: parsed.notes || null,
    },
  });

  revalidatePath("/planeamientos");
  revalidatePath(`/planeamientos/${planId}`);
  redirect(`/planeamientos/${planId}`);
}

export async function deleteLessonPlan(planId: string) {
  const teacher = await getCurrentTeacher();
  if (!teacher) throw new Error("No hay una sesión activa");
  await prisma.lessonPlan.deleteMany({ where: { id: planId, teacherId: teacher.id } });
  revalidatePath("/planeamientos");
  redirect("/planeamientos");
}
