import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentTeacher } from "@/lib/current-teacher";
import { getGoogleAuthClient, sendGmail } from "@/lib/google";
import { computeWeightedAverage, PERIOD_LABELS } from "@/lib/grades";

const bodySchema = z.object({
  sectionId: z.string(),
  period: z.string(),
  to: z.string().email(),
});

export async function POST(req: NextRequest) {
  const teacher = await getCurrentTeacher();
  if (!teacher) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const authClient = await getGoogleAuthClient();
  if (!authClient) {
    return NextResponse.json(
      { error: "Conecte su cuenta de Google para enviar correos con Gmail." },
      { status: 400 }
    );
  }

  const { sectionId, period, to } = bodySchema.parse(await req.json());

  const section = await prisma.section.findFirst({
    where: { id: sectionId, teacherId: teacher.id },
    include: {
      students: { orderBy: { order: "asc" } },
      gradeComponents: { where: { period } },
      grades: { where: { component: { period } } },
    },
  });
  if (!section) {
    return NextResponse.json({ error: "Sección no encontrada" }, { status: 404 });
  }

  const rows = section.students.map((student) => {
    const scores = new Map(
      section.grades.filter((g) => g.studentId === student.id).map((g) => [g.componentId, g.score])
    );
    const { average } = computeWeightedAverage(section.gradeComponents, scores);
    return `<tr><td style="padding:6px 10px;border:1px solid #cbd5e1;">${student.fullName}</td><td style="padding:6px 10px;border:1px solid #cbd5e1;text-align:center;">${
      average !== null ? average.toFixed(1) : "—"
    }</td></tr>`;
  });

  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h2>${section.name} · ${section.subject}</h2>
      <p>${PERIOD_LABELS[period] ?? period} — Reporte de calificaciones</p>
      <table style="border-collapse: collapse;">
        <tr><th style="padding:6px 10px;border:1px solid #cbd5e1;text-align:left;">Estudiante</th><th style="padding:6px 10px;border:1px solid #cbd5e1;">Promedio</th></tr>
        ${rows.join("")}
      </table>
      <p style="color:#64748b;margin-top:16px;">Enviado desde GestiCole por ${teacher.name ?? teacher.email}</p>
    </div>
  `;

  await sendGmail(authClient, {
    to,
    subject: `Reporte de notas — ${section.name} (${PERIOD_LABELS[period] ?? period})`,
    html,
  });

  return NextResponse.json({ ok: true });
}
