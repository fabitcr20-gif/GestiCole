"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  NotebookText,
  FileText,
  Settings,
  GraduationCap,
} from "lucide-react";
import clsx from "clsx";

const NAV_ITEMS = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/secciones", label: "Secciones", icon: Users },
  { href: "/planeamientos", label: "Planeamientos", icon: NotebookText },
  { href: "/pruebas", label: "Pruebas", icon: FileText },
  { href: "/ajustes", label: "Ajustes", icon: Settings },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-border md:bg-surface md:shrink-0">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-border">
        <GraduationCap className="text-primary" size={32} aria-hidden />
        <span className="text-xl font-bold text-foreground">GestiCole</span>
      </div>
      <nav className="flex flex-col gap-1 p-4" aria-label="Navegación principal">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-lg font-semibold transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-slate-100"
              )}
            >
              <Icon size={24} aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function MobileTabBar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navegación principal"
      className="md:hidden fixed bottom-0 left-0 right-0 z-20 flex border-t border-border bg-surface shadow-[0_-2px_8px_rgba(0,0,0,0.06)]"
    >
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={clsx(
              "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-semibold",
              active ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon size={22} aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
