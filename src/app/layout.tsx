import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar, MobileTabBar } from "@/components/nav";
import { TopBar } from "@/components/top-bar";
import { isDemoMode } from "@/lib/current-teacher";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GestiCole — Gestión Docente",
  description: "Software de gestión docente: notas, planeamientos y pruebas.",
};

// Toda la app depende de datos en vivo de la base de datos (notas, secciones,
// planeamientos), así que se renderiza dinámicamente en cada solicitud en vez
// de precalcular páginas estáticas en el build.
export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col md:flex-row bg-background text-foreground">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar demo={isDemoMode} />
          <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8 pb-24 md:pb-8 max-w-6xl w-full mx-auto">
            {children}
          </main>
        </div>
        <MobileTabBar />
      </body>
    </html>
  );
}
