"use client";

import { useState } from "react";
import { Send, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function GmailSendForm({ sectionId, period }: { sectionId: string; period: string }) {
  const [to, setTo] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage(null);
    try {
      const res = await fetch("/api/google/gmail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionId, period, to }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo enviar el correo");
      setStatus("done");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "No se pudo enviar el correo");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-end">
      <div className="flex-1 w-full">
        <label htmlFor="gmail-to" className="block text-sm font-semibold text-foreground mb-1">
          Correo del destinatario
        </label>
        <Input
          id="gmail-to"
          type="email"
          required
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="ejemplo@correo.com"
        />
      </div>
      <Button type="submit" disabled={status === "loading"} icon={<Send size={18} aria-hidden />}>
        {status === "loading" ? "Enviando..." : "Enviar por Gmail"}
      </Button>
      {status === "done" && (
        <p className="flex items-center gap-1.5 text-success text-sm font-semibold">
          <CheckCircle2 size={16} aria-hidden /> Enviado
        </p>
      )}
      {status === "error" && (
        <p className="flex items-center gap-1.5 text-danger text-sm font-semibold">
          <AlertTriangle size={16} aria-hidden /> {message}
        </p>
      )}
    </form>
  );
}
