"use client";

import { useState } from "react";
import { FileText, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GoogleDocsExportButton({ lessonPlanId }: { lessonPlanId: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    setStatus("loading");
    setMessage(null);
    try {
      const res = await fetch("/api/google/docs/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: lessonPlanId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo exportar a Google Docs");
      window.open(data.url, "_blank", "noopener,noreferrer");
      setStatus("idle");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "No se pudo exportar a Google Docs");
      setStatus("error");
    }
  }

  return (
    <div className="print:hidden">
      <Button
        variant="secondary"
        onClick={handleClick}
        disabled={status === "loading"}
        icon={<FileText size={18} aria-hidden />}
      >
        {status === "loading" ? "Exportando..." : "Exportar a Google Docs"}
      </Button>
      {status === "error" && (
        <p className="mt-2 flex items-center gap-1.5 text-danger text-sm font-semibold">
          <AlertTriangle size={16} aria-hidden /> {message}
        </p>
      )}
    </div>
  );
}
