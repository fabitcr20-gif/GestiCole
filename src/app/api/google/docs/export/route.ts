import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentTeacher } from "@/lib/current-teacher";
import { getGoogleAuthClient, getOrCreateBackupFolder, createGoogleDoc } from "@/lib/google";
import { buildLessonPlanSections } from "@/lib/mep/format-plan";

const bodySchema = z.object({ id: z.string() });

export async function POST(req: NextRequest) {
  const teacher = await getCurrentTeacher();
  if (!teacher) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const authClient = await getGoogleAuthClient();
  if (!authClient) {
    return NextResponse.json(
      { error: "Conecte su cuenta de Google para exportar a Google Docs." },
      { status: 400 }
    );
  }

  const { id } = bodySchema.parse(await req.json());
  const plan = await prisma.lessonPlan.findFirst({
    where: { id, teacherId: teacher.id },
    include: { section: true },
  });
  if (!plan) {
    return NextResponse.json({ error: "Planeamiento no encontrado" }, { status: 404 });
  }

  const sections = buildLessonPlanSections(plan, teacher.name);

  try {
    const folderId = await getOrCreateBackupFolder(authClient, teacher.driveFolderId);
    const { documentId, url } = await createGoogleDoc(authClient, plan.title, sections, folderId);
    await prisma.$transaction([
      prisma.teacher.update({ where: { id: teacher.id }, data: { driveFolderId: folderId } }),
      prisma.lessonPlan.update({ where: { id: plan.id }, data: { googleDocId: documentId } }),
    ]);
    return NextResponse.json({ ok: true, url });
  } catch {
    return NextResponse.json({ error: "No se pudo exportar a Google Docs." }, { status: 500 });
  }
}
