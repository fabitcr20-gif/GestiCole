import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// Scopes necesarios para las integraciones de Google Workspace.
// El docente ve claramente, en la pantalla de consentimiento de Google,
// para qué se usa cada permiso.
const GOOGLE_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/drive.file", // Crear/leer archivos que la app respalda en Drive
  "https://www.googleapis.com/auth/documents", // Exportar planeamientos como Google Docs
  "https://www.googleapis.com/auth/gmail.send", // Enviar reportes por Gmail
  "https://www.googleapis.com/auth/classroom.courses.readonly", // Leer cursos de Classroom
  "https://www.googleapis.com/auth/classroom.rosters.readonly", // Leer listas de estudiantes
].join(" ");

const hasGoogleCredentials = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

export const { handlers, signIn, signOut, auth } = NextAuth({
  // GestiCole es una app de uso personal/autoalojada (no un SaaS multi-tenant
  // público en un dominio fijo), por lo que se confía en el host de la
  // solicitud entrante en vez de exigir una lista fija de dominios.
  trustHost: true,
  providers: hasGoogleCredentials
    ? [
        Google({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          authorization: {
            params: {
              scope: GOOGLE_SCOPES,
              access_type: "offline",
              prompt: "consent",
            },
          },
        }),
      ]
    : [],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/ingresar",
  },
  callbacks: {
    async jwt({ token, account }) {
      // Guardamos los tokens de Google en el JWT para poder llamar
      // a Drive/Gmail/Classroom desde el servidor en nombre del docente.
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
        return token;
      }

      const expiresAt = token.expiresAt as number | undefined;
      if (expiresAt && Date.now() < expiresAt * 1000 - 60_000) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (session.user) {
        (session as unknown as { accessToken?: string }).accessToken =
          token.accessToken as string | undefined;
      }
      return session;
    },
  },
});

async function refreshAccessToken(token: Record<string, unknown>) {
  const refreshToken = token.refreshToken as string | undefined;
  if (!refreshToken) return token;

  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID ?? "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });
    const refreshed = await res.json();
    if (!res.ok) throw refreshed;

    return {
      ...token,
      accessToken: refreshed.access_token,
      expiresAt: Math.floor(Date.now() / 1000 + refreshed.expires_in),
      refreshToken: refreshed.refresh_token ?? refreshToken,
    };
  } catch {
    return { ...token, error: "RefreshAccessTokenError" as const };
  }
}

export const isGoogleConfigured = hasGoogleCredentials;
