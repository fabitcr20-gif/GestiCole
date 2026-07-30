import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentTeacher } from "@/lib/current-teacher";
import { generateMepLessonPlan, isClaudeConfigured } from "@/lib/mep/generate-plan";

const bodySchema = z.object({
  title: z.string().trim().min(1),
  unit: z.string().trim().optional(),
  asignatura: z.string().trim().optional(),
  nivelCiclo: z.string().trim().optional(),
  periodicidad: z.string().trim().optional(),
  competencias: z.string().trim().optional(),
  institutionalContext: z.string().trim().optional(),
  socialContext: z.string().trim().optional(),
  groupCharacteristics: z.string().trim().optional(),
  learningStyles: z.string().trim().optional(),
  duaSupports: z.array(z.string()).optional(),
  specialEducationNeeds: z.string().trim().optional(),
  referenceDocuments: z
    .array(z.object({ type: z.string(), fileName: z.string(), extractedText: z.string().nullable() }))
    .optional(),
});

export async function POST(req: NextRequest) {
  const teacher = await getCurrentTeacher();
  if (!teacher) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!isClaudeConfigured) {
    return NextResponse.json(
      { error: "La generación con IA no está configurada todavía. Agregue ANTHROPIC_API_KEY." },
      { status: 400 }
    );
  }

  const parsed = bodySchema.parse(await req.json());

  try {
    const { frameworkKey, result } = await generateMepLessonPlan(parsed);
    return NextResponse.json({ ok: true, frameworkKey, ...result });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "No se pudo generar el planeamiento con IA." },
      { status: 500 }
    );
  }
}
