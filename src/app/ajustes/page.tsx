import { CheckCircle2, Info, ShieldCheck } from "lucide-react";
import { auth } from "@/auth";
import { getCurrentTeacher, isDemoMode } from "@/lib/current-teacher";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { ClassroomImport } from "@/components/classroom-import";

export default async function SettingsPage() {
  const teacher = await getCurrentTeacher();
  if (!teacher) return null;

  const session = isDemoMode ? null : await auth();
  const sections = await prisma.section.findMany({
    where: { teacherId: teacher.id },
    select: { id: true, name: true, subject: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader title="Ajustes" description="Su cuenta e integraciones con Google." />

      <Card className="p-6 mb-6">
        <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
          <ShieldCheck size={22} className="text-primary" aria-hidden />
          Cuenta
        </h2>
        <p className="text-foreground"><strong>Nombre:</strong> {teacher.name ?? "—"}</p>
        <p className="text-foreground"><strong>Correo:</strong> {teacher.email}</p>

        {isDemoMode ? (
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-warning-bg border border-warning-border px-4 py-3 text-warning">
            <Info size={20} aria-hidden className="shrink-0 mt-0.5" />
            <p>
              Está en modo demostración. Configure <code>GOOGLE_CLIENT_ID</code> y{" "}
              <code>GOOGLE_CLIENT_SECRET</code> (vea el README) para activar el inicio de sesión
              con Google y las integraciones con Drive, Gmail y Classroom.
            </p>
          </div>
        ) : session ? (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-success-bg border border-success-border px-4 py-3 text-success">
            <CheckCircle2 size={20} aria-hidden />
            <p>Su cuenta de Google está conectada.</p>
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-warning-bg border border-warning-border px-4 py-3 text-warning">
            <Info size={20} aria-hidden />
            <p>No hay una sesión de Google activa.</p>
          </div>
        )}
      </Card>

      {!isDemoMode && (
        <Card className="p-6">
          <h2 className="text-lg font-bold text-foreground mb-1">
            Importar estudiantes desde Google Classroom
          </h2>
          <p className="text-muted-foreground mb-4">
            Traiga la lista de estudiantes de uno de sus cursos de Classroom directamente a una
            sección.
          </p>
          <ClassroomImport sections={sections} />
        </Card>
      )}
    </div>
  );
}
