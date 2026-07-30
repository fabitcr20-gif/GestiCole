import { GraduationCap } from "lucide-react";
import { signIn } from "@/auth";
import { Card } from "@/components/ui/card";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="max-w-md w-full p-8 text-center">
        <GraduationCap className="mx-auto text-primary" size={56} aria-hidden />
        <h1 className="mt-4 text-2xl font-bold text-foreground">
          Bienvenido(a) a GestiCole
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Ingrese con su cuenta de Google para llevar el control de sus notas,
          planeamientos y pruebas.
        </p>
        <form
          className="mt-6"
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-3 rounded-xl bg-primary px-6 py-4 text-lg font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover"
          >
            <GoogleIcon />
            Ingresar con Google
          </button>
        </form>
      </Card>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#fff"
        d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81Z"
      />
    </svg>
  );
}
