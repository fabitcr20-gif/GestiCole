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

const mepPlanSchema = z.object({
  title: z.string().trim().min(1, "El título es obligatorio"),
  unit: z.string().trim().optional(),
  sectionId: z.string().trim().optional(),
  startDate: z.string().trim().optional(),
  endDate: z.string().trim().optional(),
  direccionRegional: z.string().trim().optional(),
  centroEducativo: z.string().trim().optional(),
  asignatura: z.string().trim().optional(),
  nivelCiclo: z.string().trim().optional(),
  periodicidad: z.string().trim().optional(),
  cursoLectivo: z.number().int().optional(),
  competencias: z.string().trim().optional(),
  institutionalContext: z.string().trim().optional(),
  socialContext: z.string().trim().optional(),
  groupCharacteristics: z.string().trim().optional(),
  learningStyles: z.string().trim().optional(),
  duaSupports: z.array(z.string()).optional(),
  specialEducationNeeds: z.string().trim().optional(),
  pedagogicalApproach: z.string().trim().optional(),
  objectives: z.string().trim().min(1, "Los aprendizajes esperados son obligatorios"),
  strategies: z.string().trim().min(1, "Las estrategias de mediación son obligatorias"),
  evaluationCriteria: z.string().trim().min(1, "Los indicadores de evaluación son obligatorios"),
  resources: z.string().trim().optional(),
  reflection: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  aiGenerated: z.boolean().optional(),
  documents: z
    .array(z.object({ type: z.string(), fileName: z.string(), extractedText: z.string().nullable() }))
    .optional(),
});

export type MepPlanFormInput = z.infer<typeof mepPlanSchema>;

/** Crea un planeamiento completo alineado a la Plantilla Oficial Anexo A - DDC/MEP. */
export async function createMepLessonPlan(input: MepPlanFormInput) {
  const teacher = await getCurrentTeacher();
  if (!teacher) throw new Error("No hay una sesión activa");
  const parsed = mepPlanSchema.parse(input);

  const plan = await prisma.lessonPlan.create({
    data: {
      teacherId: teacher.id,
      title: parsed.title,
      unit: parsed.unit || null,
      sectionId: parsed.sectionId || null,
      startDate: parsed.startDate ? new Date(parsed.startDate) : null,
      endDate: parsed.endDate ? new Date(parsed.endDate) : null,
      direccionRegional: parsed.direccionRegional || null,
      centroEducativo: parsed.centroEducativo || null,
      asignatura: parsed.asignatura || null,
      nivelCiclo: parsed.nivelCiclo || null,
      periodicidad: parsed.periodicidad || null,
      cursoLectivo: parsed.cursoLectivo ?? 2026,
      competencias: parsed.competencias || null,
      institutionalContext: parsed.institutionalContext || null,
      socialContext: parsed.socialContext || null,
      groupCharacteristics: parsed.groupCharacteristics || null,
      learningStyles: parsed.learningStyles || null,
      duaSupports: parsed.duaSupports ?? [],
      specialEducationNeeds: parsed.specialEducationNeeds || null,
      pedagogicalApproach: parsed.pedagogicalApproach || null,
      objectives: parsed.objectives,
      strategies: parsed.strategies,
      evaluationCriteria: parsed.evaluationCriteria,
      resources: parsed.resources || null,
      reflection: parsed.reflection || null,
      notes: parsed.notes || null,
      aiGenerated: parsed.aiGenerated ?? false,
      documents:
        parsed.documents && parsed.documents.length > 0
          ? {
              create: parsed.documents.map((d) => ({
                type: d.type,
                fileName: d.fileName,
                extractedText: d.extractedText,
              })),
            }
          : undefined,
    },
  });

  revalidatePath("/planeamientos");
  redirect(`/planeamientos/${plan.id}`);
}
