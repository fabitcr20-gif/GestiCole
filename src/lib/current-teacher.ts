import { auth, isGoogleConfigured } from "@/auth";
import { prisma } from "@/lib/prisma";

const DEMO_EMAIL = "demo@gesticole.local";

/**
 * Devuelve el docente actual, creándolo si es la primera vez que inicia sesión.
 * Si Google OAuth no está configurado (por ejemplo, en un entorno de pruebas
 * sin credenciales), la app opera en modo demostración con un docente local
 * para que todas las pantallas se puedan usar y probar sin bloquear en el login.
 */
export async function getCurrentTeacher() {
  if (!isGoogleConfigured) {
    return prisma.teacher.upsert({
      where: { email: DEMO_EMAIL },
      update: {},
      create: { email: DEMO_EMAIL, name: "Profesor(a) Demo" },
    });
  }

  const session = await auth();
  if (!session?.user?.email) {
    return null;
  }

  return prisma.teacher.upsert({
    where: { email: session.user.email },
    update: {
      name: session.user.name ?? undefined,
      image: session.user.image ?? undefined,
    },
    create: {
      email: session.user.email,
      name: session.user.name ?? undefined,
      image: session.user.image ?? undefined,
    },
  });
}

export const isDemoMode = !isGoogleConfigured;
