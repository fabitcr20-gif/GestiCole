"use client";

import { useState } from "react";
import { CloudUpload, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DriveBackupButton({ type, id }: { type: "lessonPlan" | "exam"; id: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    setStatus("loading");
    setMessage(null);
    try {
      const res = await fetch("/api/google/drive/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo respaldar en Drive");
      setStatus("done");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "No se pudo respaldar en Drive");
      setStatus("error");
    }
  }

  return (
    <div className="print:hidden">
      <Button
        variant="secondary"
        onClick={handleClick}
        disabled={status === "loading"}
        icon={<CloudUpload size={18} aria-hidden />}
      >
        {status === "loading" ? "Respaldando..." : "Respaldar en Drive"}
      </Button>
      {status === "done" && (
        <p className="mt-2 flex items-center gap-1.5 text-success text-sm font-semibold">
          <CheckCircle2 size={16} aria-hidden /> Respaldado en Google Drive
        </p>
      )}
      {status === "error" && (
        <p className="mt-2 flex items-center gap-1.5 text-danger text-sm font-semibold">
          <AlertTriangle size={16} aria-hidden /> {message}
        </p>
      )}
    </div>
  );
}
