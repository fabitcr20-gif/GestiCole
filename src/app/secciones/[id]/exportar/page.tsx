import { notFound } from "next/navigation";
import { FileSpreadsheet, FileText, FileJson } from "lucide-react";
import { getCurrentTeacher } from "@/lib/current-teacher";
import { prisma } from "@/lib/prisma";
import { PERIOD_LABELS, PERIODS } from "@/lib/grades";
import { Mail } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { GmailSendForm } from "@/components/gmail-send-form";

export default async function ExportPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ periodo?: string }>;
}) {
  const { id } = await params;
  const { periodo } = await searchParams;
  const period = periodo && PERIODS.includes(periodo as (typeof PERIODS)[number]) ? periodo : "I";

  const teacher = await getCurrentTeacher();
  if (!teacher) return null;

  const section = await prisma.section.findFirst({ where: { id, teacherId: teacher.id } });
  if (!section) notFound();

  return (
    <div>
      <PageHeader
        title="Exportar notas"
        description={`${section.name} · ${section.subject}`}
      />

      <div className="flex items-center gap-2 mb-6" role="tablist" aria-label="Periodo">
        {PERIODS.map((p) => (
          <a
            key={p}
            href={`/secciones/${section.id}/exportar?periodo=${p}`}
            role="tab"
            aria-selected={p === period}
            className={`rounded-lg px-4 py-2 text-base font-semibold border ${
              p === period
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-white text-foreground border-border hover:bg-slate-50"
            }`}
          >
            {PERIOD_LABELS[p]}
          </a>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ExportOption
          href={`/api/sections/${section.id}/export?periodo=${period}&format=pdf`}
          icon={FileText}
          title="PDF para imprimir"
          description="Reporte oficial listo para entregar o archivar."
        />
        <ExportOption
          href={`/api/sections/${section.id}/export?periodo=${period}&format=xlsx`}
          icon={FileSpreadsheet}
          title="Excel (.xlsx)"
          description="Para revisar o editar en Excel / Google Sheets."
        />
        <ExportOption
          href={`/api/sections/${section.id}/export?periodo=${period}&format=csv`}
          icon={FileJson}
          title="CSV"
          description="Formato compatible con la mayoría de sistemas."
        />
      </div>

      <Card className="p-5 mt-6 max-w-2xl">
        <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
          <Mail size={22} className="text-primary" aria-hidden />
          Enviar reporte por Gmail
        </h2>
        <p className="text-muted-foreground mb-4">
          Envíe el reporte de calificaciones a un correo (por ejemplo, coordinación académica).
        </p>
        <GmailSendForm sectionId={section.id} period={period} />
      </Card>
    </div>
  );
}

function ExportOption({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: typeof FileText;
  title: string;
  description: string;
}) {
  return (
    <Card className="p-5">
      <Icon className="text-primary mb-2" size={30} aria-hidden />
      <p className="text-lg font-bold text-foreground">{title}</p>
      <p className="text-muted-foreground mb-4">{description}</p>
      <a
        href={href}
        className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-base font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover"
      >
        Descargar
      </a>
    </Card>
  );
}
