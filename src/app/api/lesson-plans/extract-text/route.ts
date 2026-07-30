import { NextRequest, NextResponse } from "next/server";
import { getCurrentTeacher } from "@/lib/current-teacher";
import { extractTextFromFile } from "@/lib/mep/extract-text";

// Vercel rechaza cuerpos de solicitud mayores a ~4.5 MB antes de que este código
// se ejecute, así que este límite se mantiene por debajo de ese tope de la plataforma.
const MAX_SIZE = 4 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const teacher = await getCurrentTeacher();
  if (!teacher) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  const type = formData.get("type");

  if (!(file instanceof File) || typeof type !== "string") {
    return NextResponse.json({ error: "Archivo inválido" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "El archivo es demasiado grande (máximo 4 MB)." }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const extractedText = await extractTextFromFile(buffer, file.type);
    return NextResponse.json({ ok: true, fileName: file.name, type, extractedText });
  } catch {
    return NextResponse.json(
      { error: "No se pudo leer el documento. Verifique que sea un PDF o archivo de texto válido." },
      { status: 500 }
    );
  }
}
