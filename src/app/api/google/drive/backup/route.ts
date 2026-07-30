import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentTeacher } from "@/lib/current-teacher";
import { getGoogleAuthClient, getOrCreateBackupFolder, uploadFileToDrive } from "@/lib/google";

const bodySchema = z.object({
  type: z.enum(["lessonPlan", "exam"]),
  id: z.string(),
});

export async function POST(req: NextRequest) {
  const teacher = await getCurrentTeacher();
  if (!teacher) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const authClient = await getGoogleAuthClient();
  if (!authClient) {
    return NextResponse.json(
      { error: "Conecte su cuenta de Google para respaldar en Drive." },
      { status: 400 }
    );
  }

  const { type, id } = bodySchema.parse(await req.json());

  let fileName: string;
  let content: string;

  if (type === "lessonPlan") {
    const plan = await prisma.lessonPlan.findFirst({ where: { id, teacherId: teacher.id } });
    if (!plan) return NextResponse.json({ error: "Planeamiento no encontrado" }, { status: 404 });
    fileName = `Planeamiento - ${plan.title}.txt`;
    content = [
      plan.title,
      plan.unit ? `Unidad: ${plan.unit}` : "",
      "",
      "Objetivos:",
      plan.objectives,
      "",
      "Estrategias de mediación:",
      plan.strategies,
      "",
      "Criterios de evaluación:",
      plan.evaluationCriteria,
      plan.resources ? `\nRecursos:\n${plan.resources}` : "",
    ].join("\n");

    const folderId = await getOrCreateBackupFolder(authClient, teacher.driveFolderId);
    const file = await uploadFileToDrive(authClient, folderId, fileName, "text/plain", content);
    await prisma.$transaction([
      prisma.teacher.update({ where: { id: teacher.id }, data: { driveFolderId: folderId } }),
      prisma.lessonPlan.update({ where: { id: plan.id }, data: { driveFileId: file.id } }),
    ]);
    return NextResponse.json({ ok: true, link: file.webViewLink });
  }

  const exam = await prisma.exam.findFirst({ where: { id, teacherId: teacher.id } });
  if (!exam) return NextResponse.json({ error: "Prueba no encontrada" }, { status: 404 });
  const questions = exam.questions as unknown as { prompt: string; points: number }[];
  fileName = `Prueba - ${exam.title}.txt`;
  content = [
    exam.title,
    exam.instructions ?? "",
    "",
    ...questions.map((q, i) => `${i + 1}. ${q.prompt} (${q.points} pts)`),
  ].join("\n");

  const folderId = await getOrCreateBackupFolder(authClient, teacher.driveFolderId);
  const file = await uploadFileToDrive(authClient, folderId, fileName, "text/plain", content);
  await prisma.$transaction([
    prisma.teacher.update({ where: { id: teacher.id }, data: { driveFolderId: folderId } }),
    prisma.exam.update({ where: { id: exam.id }, data: { driveFileId: file.id } }),
  ]);
  return NextResponse.json({ ok: true, link: file.webViewLink });
}
