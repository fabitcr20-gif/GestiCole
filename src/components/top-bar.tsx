import { Info, LogOut } from "lucide-react";
import { auth, signOut } from "@/auth";

export async function TopBar({ demo }: { demo: boolean }) {
  const session = demo ? null : await auth();

  return (
    <header className="border-b border-border bg-surface">
      {demo && (
        <div className="flex items-center gap-2 bg-warning-bg text-warning border-b border-warning-border px-4 py-2 text-sm font-medium">
          <Info size={18} aria-hidden />
          Modo demostración: conecte su cuenta de Google en Ajustes para activar el
          inicio de sesión y las integraciones con Drive, Gmail y Classroom.
        </div>
      )}
      {session?.user && (
        <div className="flex items-center justify-end gap-3 px-4 py-2 sm:px-8">
          <span className="text-sm text-muted-foreground">
            {session.user.name ?? session.user.email}
          </span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/ingresar" });
            }}
          >
            <button
              type="submit"
              className="flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-primary"
            >
              <LogOut size={16} aria-hidden />
              Cerrar sesión
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
