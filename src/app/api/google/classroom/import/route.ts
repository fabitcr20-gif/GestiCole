import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentTeacher } from "@/lib/current-teacher";
import { getGoogleAuthClient, listClassroomStudents } from "@/lib/google";

const bodySchema = z.object({
  sectionId: z.string(),
  courseId: z.string(),
});

export async function POST(req: NextRequest) {
  const teacher = await getCurrentTeacher();
  if (!teacher) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const authClient = await getGoogleAuthClient();
  if (!authClient) {
    return NextResponse.json(
      { error: "Conecte su cuenta de Google para sincronizar con Classroom." },
      { status: 400 }
    );
  }

  const { sectionId, courseId } = bodySchema.parse(await req.json());

  const section = await prisma.section.findFirst({
    where: { id: sectionId, teacherId: teacher.id },
    include: { students: true },
  });
  if (!section) {
    return NextResponse.json({ error: "Sección no encontrada" }, { status: 404 });
  }

  const classroomStudents = await listClassroomStudents(authClient, courseId);

  let created = 0;
  let nextOrder = section.students.length;

  await prisma.$transaction(async (tx) => {
    for (const cs of classroomStudents) {
      const fullName = cs.profile?.name?.fullName;
      const email = cs.profile?.emailAddress;
      if (!fullName) continue;

      const exists = section.students.some(
        (s) => s.fullName.toLowerCase() === fullName.toLowerCase()
      );
      if (exists) continue;

      await tx.student.create({
        data: { sectionId, fullName, email: email ?? null, order: nextOrder },
      });
      nextOrder += 1;
      created += 1;
    }
  });

  await prisma.teacher.update({
    where: { id: teacher.id },
    data: { classroomCourses: courseId },
  });

  return NextResponse.json({ ok: true, created });
}
