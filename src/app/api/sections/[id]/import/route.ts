import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentTeacher } from "@/lib/current-teacher";

const bodySchema = z.object({
  rows: z.array(z.record(z.string(), z.string())),
  mapping: z.record(z.string(), z.string()), // header -> "fullName" | "studentCode" | "email" | "ignore" | "grade:<componentId>"
});

export async function POST(
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
    include: { students: true, gradeComponents: true },
  });
  if (!section) {
    return NextResponse.json({ error: "Sección no encontrada" }, { status: 404 });
  }

  const { rows, mapping } = bodySchema.parse(await req.json());

  const nameHeader = Object.entries(mapping).find(([, v]) => v === "fullName")?.[0];
  if (!nameHeader) {
    return NextResponse.json(
      { error: "Debe indicar cuál columna tiene el nombre del estudiante" },
      { status: 400 }
    );
  }
  const codeHeader = Object.entries(mapping).find(([, v]) => v === "studentCode")?.[0];
  const emailHeader = Object.entries(mapping).find(([, v]) => v === "email")?.[0];
  const gradeHeaders = Object.entries(mapping).filter(([, v]) => v.startsWith("grade:"));

  let created = 0;
  let updated = 0;
  let gradesWritten = 0;
  let nextOrder = await prisma.student.count({ where: { sectionId } });

  await prisma.$transaction(async (tx) => {
    for (const row of rows) {
      const fullName = row[nameHeader]?.trim();
      if (!fullName) continue;

      const studentCode = codeHeader ? row[codeHeader]?.trim() || null : null;
      const email = emailHeader ? row[emailHeader]?.trim() || null : null;

      let student = section.students.find(
        (s) =>
          (studentCode && s.studentCode === studentCode) ||
          s.fullName.toLowerCase() === fullName.toLowerCase()
      );

      if (student) {
        await tx.student.update({
          where: { id: student.id },
          data: {
            fullName,
            studentCode: studentCode ?? student.studentCode,
            email: email ?? student.email,
          },
        });
        updated += 1;
      } else {
        student = await tx.student.create({
          data: { sectionId, fullName, studentCode, email, order: nextOrder },
        });
        nextOrder += 1;
        section.students.push(student);
        created += 1;
      }

      for (const [header, target] of gradeHeaders) {
        const componentId = target.replace("grade:", "");
        const raw = row[header]?.trim();
        if (!raw) continue;
        const score = Number(raw.replace(",", "."));
        if (Number.isNaN(score)) continue;

        await tx.grade.upsert({
          where: { studentId_componentId: { studentId: student.id, componentId } },
          update: { score: Math.max(0, Math.min(100, score)) },
          create: {
            studentId: student.id,
            componentId,
            sectionId,
            score: Math.max(0, Math.min(100, score)),
          },
        });
        gradesWritten += 1;
      }
    }
  });

  return NextResponse.json({ ok: true, created, updated, gradesWritten });
}
