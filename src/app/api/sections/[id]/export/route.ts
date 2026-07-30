import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { prisma } from "@/lib/prisma";
import { getCurrentTeacher } from "@/lib/current-teacher";
import { computeWeightedAverage, PERIOD_LABELS } from "@/lib/grades";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sectionId } = await params;
  const teacher = await getCurrentTeacher();
  if (!teacher) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const period = searchParams.get("periodo") ?? "I";
  const format = searchParams.get("format") ?? "pdf";

  const section = await prisma.section.findFirst({
    where: { id: sectionId, teacherId: teacher.id },
    include: {
      students: { orderBy: { order: "asc" } },
      gradeComponents: { where: { period }, orderBy: { order: "asc" } },
      grades: { where: { component: { period } } },
    },
  });

  if (!section) {
    return NextResponse.json({ error: "Sección no encontrada" }, { status: 404 });
  }

  const header = ["Estudiante", "Código", ...section.gradeComponents.map((c) => c.name), "Promedio"];
  const rows = section.students.map((student) => {
    const scores = new Map(
      section.grades
        .filter((g) => g.studentId === student.id)
        .map((g) => [g.componentId, g.score])
    );
    const { average } = computeWeightedAverage(section.gradeComponents, scores);
    return [
      student.fullName,
      student.studentCode ?? "",
      ...section.gradeComponents.map((c) => {
        const score = scores.get(c.id);
        return score === null || score === undefined ? "" : score.toString();
      }),
      average !== null ? average.toFixed(1) : "",
    ];
  });

  const fileBase = `${section.name}-${section.subject}-${PERIOD_LABELS[period] ?? period}`
    .replace(/[^\w\-]+/g, "_")
    .toLowerCase();

  if (format === "csv") {
    const csv = Papa.unparse({ fields: header, data: rows });
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileBase}.csv"`,
      },
    });
  }

  if (format === "xlsx") {
    const worksheet = XLSX.utils.aoa_to_sheet([header, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Notas");
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileBase}.xlsx"`,
      },
    });
  }

  // PDF por defecto: listo para imprimir.
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(14);
  doc.text(`${section.name} · ${section.subject}`, 14, 15);
  doc.setFontSize(10);
  doc.text(`${PERIOD_LABELS[period] ?? period} — Reporte de calificaciones`, 14, 21);

  autoTable(doc, {
    head: [header],
    body: rows,
    startY: 26,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [29, 78, 216] },
  });

  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileBase}.pdf"`,
    },
  });
}
