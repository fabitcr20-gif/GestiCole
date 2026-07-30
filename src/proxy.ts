import { NextResponse } from "next/server";
import { auth } from "@/auth";

const PUBLIC_PATHS = ["/ingresar", "/api/auth"];

export default auth((req) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    // Modo demostración: sin Google OAuth configurado, no se exige sesión.
    return NextResponse.next();
  }

  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  if (isPublic || req.auth) {
    return NextResponse.next();
  }

  const signInUrl = new URL("/ingresar", req.nextUrl.origin);
  return NextResponse.redirect(signInUrl);
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
