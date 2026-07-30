import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentTeacher } from "@/lib/current-teacher";

const bodySchema = z.object({
  scores: z.array(
    z.object({
      studentId: z.string(),
      componentId: z.string(),
      score: z.number().min(0).max(100).nullable(),
    })
  ),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sectionId } = await params;
  const teacher = await getCurrentTeacher();
  if (!teacher) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const section = await prisma.section.findFirst({
    where: { id: sectionId, teacherId: teacher.id },
  });
  if (!section) {
    return NextResponse.json({ error: "Sección no encontrada" }, { status: 404 });
  }

  const json = await req.json();
  const { scores } = bodySchema.parse(json);

  await prisma.$transaction(
    scores.map(({ studentId, componentId, score }) =>
      prisma.grade.upsert({
        where: { studentId_componentId: { studentId, componentId } },
        update: { score },
        create: { studentId, componentId, sectionId, score },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
