import { NextResponse } from "next/server";
import { getCurrentTeacher } from "@/lib/current-teacher";
import { getGoogleAuthClient, listClassroomCourses } from "@/lib/google";

export async function GET() {
  const teacher = await getCurrentTeacher();
  if (!teacher) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const authClient = await getGoogleAuthClient();
  if (!authClient) {
    return NextResponse.json(
      { error: "Conecte su cuenta de Google para ver sus cursos de Classroom." },
      { status: 400 }
    );
  }

  try {
    const courses = await listClassroomCourses(authClient);
    return NextResponse.json({
      courses: courses.map((c) => ({ id: c.id, name: c.name, section: c.section })),
    });
  } catch {
    return NextResponse.json(
      { error: "No se pudo leer Google Classroom. Vuelva a iniciar sesión e intente de nuevo." },
      { status: 502 }
    );
  }
}
