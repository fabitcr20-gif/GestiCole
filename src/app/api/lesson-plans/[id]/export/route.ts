import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { prisma } from "@/lib/prisma";
import { getCurrentTeacher } from "@/lib/current-teacher";
import { getFrameworkByKey, describeDuaSupports } from "@/lib/mep/pedagogical-frameworks";

const PAGE_WIDTH = 297;
const PAGE_HEIGHT = 210;
const MARGIN = 15;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const FOOTER_TEXT = "Planeamiento Didáctico Desarrollado con GestiCole";

function loadLogoDataUrl(): string | null {
  try {
    const logoPath = path.join(process.cwd(), "public", "mep-logo.png");
    if (!fs.existsSync(logoPath)) return null;
    const buffer = fs.readFileSync(logoPath);
    return `data:image/png;base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > PAGE_HEIGHT - 20) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}

function addSectionTitle(doc: jsPDF, title: string, y: number): number {
  y = ensureSpace(doc, y, 12);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(title, MARGIN, y);
  doc.setFont("helvetica", "normal");
  return y + 6;
}

function addWrappedText(doc: jsPDF, text: string, y: number): number {
  doc.setFontSize(10);
  const paragraphs = text.split("\n");
  for (const paragraph of paragraphs) {
    const lines = paragraph.length > 0 ? doc.splitTextToSize(paragraph, CONTENT_WIDTH) : [""];
    for (const line of lines) {
      y = ensureSpace(doc, y, 6);
      doc.text(line, MARGIN, y);
      y += 5.2;
    }
  }
  return y + 3;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const teacher = await getCurrentTeacher();
  if (!teacher) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const plan = await prisma.lessonPlan.findFirst({
    where: { id, teacherId: teacher.id },
    include: { section: true },
  });
  if (!plan) {
    return NextResponse.json({ error: "Planeamiento no encontrado" }, { status: 404 });
  }

  const framework = getFrameworkByKey(plan.pedagogicalApproach);
  const duaLabels = describeDuaSupports((plan.duaSupports as string[] | null) ?? []);
  const logo = loadLogoDataUrl();

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  let y = MARGIN;
  if (logo) {
    doc.addImage(logo, "PNG", MARGIN, y, 22, 22);
  }
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("MINISTERIO DE EDUCACIÓN PÚBLICA", PAGE_WIDTH / 2, y + 6, { align: "center" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Plantilla Oficial de Planeamiento Didáctico Anexo A - DDC/MEP", PAGE_WIDTH / 2, y + 12, {
    align: "center",
  });
  y += 26;

  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text(plan.title, PAGE_WIDTH / 2, y, { align: "center" });
  doc.setFont("helvetica", "normal");
  y += 6;
  if (plan.unit) {
    doc.setFontSize(11);
    doc.text(plan.unit, PAGE_WIDTH / 2, y, { align: "center" });
    y += 6;
  }
  y += 2;

  const adminFields: [string, string][] = [
    ["Dirección Regional", plan.direccionRegional ?? "—"],
    ["Centro Educativo", plan.centroEducativo ?? "—"],
    ["Docente", teacher.name ?? "—"],
    ["Asignatura", plan.asignatura ?? plan.section?.subject ?? "—"],
    ["Nivel / Ciclo", plan.nivelCiclo ?? "—"],
    ["Periodicidad", plan.periodicidad ?? "—"],
    ["Curso Lectivo", plan.cursoLectivo ? String(plan.cursoLectivo) : "—"],
    ["Modelo Pedagógico MEP", framework?.label ?? "—"],
  ];

  autoTable(doc, {
    body: [
      [adminFields[0], adminFields[1], adminFields[2], adminFields[3]],
      [adminFields[4], adminFields[5], adminFields[6], adminFields[7]],
    ].map((row) => row.map(([label, value]) => `${label}\n${value}`)),
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    styles: { fontSize: 8.5, cellPadding: 2, lineColor: [200, 200, 200] },
    theme: "grid",
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  if (plan.competencias) {
    y = addSectionTitle(doc, "Competencia(s) General(es) del Periodo", y);
    y = addWrappedText(doc, plan.competencias, y);
  }

  if (plan.institutionalContext) {
    y = addSectionTitle(doc, "Contexto Institucional", y);
    y = addWrappedText(doc, plan.institutionalContext, y);
  }
  if (plan.socialContext) {
    y = addSectionTitle(doc, "Contexto Social y Comunitario", y);
    y = addWrappedText(doc, plan.socialContext, y);
  }
  if (plan.groupCharacteristics) {
    y = addSectionTitle(doc, "Características del Grupo", y);
    y = addWrappedText(doc, plan.groupCharacteristics, y);
  }
  if (plan.learningStyles) {
    y = addSectionTitle(doc, "Estilos y Ritmos de Aprendizaje", y);
    y = addWrappedText(doc, plan.learningStyles, y);
  }
  if (duaLabels.length > 0) {
    y = addSectionTitle(doc, "Apoyos DUA Aplicados", y);
    y = addWrappedText(doc, duaLabels.map((d) => `• ${d.principle}: ${d.text}`).join("\n"), y);
  }
  if (plan.specialEducationNeeds) {
    y = addSectionTitle(doc, "Adecuaciones Curriculares", y);
    y = addWrappedText(doc, plan.specialEducationNeeds, y);
  }

  y = addSectionTitle(doc, "Aprendizajes Esperados", y);
  y = addWrappedText(doc, plan.objectives, y);

  y = addSectionTitle(doc, "Estrategias de Mediación Pedagógica", y);
  y = addWrappedText(doc, plan.strategies, y);

  y = addSectionTitle(doc, "Indicadores de Evaluación", y);
  y = addWrappedText(doc, plan.evaluationCriteria, y);

  if (plan.resources) {
    y = addSectionTitle(doc, "Recursos y Materiales", y);
    y = addWrappedText(doc, plan.resources, y);
  }
  if (plan.reflection) {
    y = addSectionTitle(doc, "Reflexión Docente", y);
    y = addWrappedText(doc, plan.reflection, y);
  }
  if (plan.notes) {
    y = addSectionTitle(doc, "Notas Adicionales", y);
    y = addWrappedText(doc, plan.notes, y);
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8.5);
    doc.setTextColor(120);
    doc.text(FOOTER_TEXT, PAGE_WIDTH / 2, PAGE_HEIGHT - 8, { align: "center" });
    doc.text(`Página ${i} de ${pageCount}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 8, { align: "right" });
    doc.setTextColor(0);
  }

  const fileBase = plan.title.replace(/[^\w\-]+/g, "_").toLowerCase();
  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="planeamiento_${fileBase}.pdf"`,
    },
  });
}
