"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintButton() {
  return (
    <Button
      variant="secondary"
      icon={<Printer size={18} aria-hidden />}
      onClick={() => window.print()}
      className="print:hidden"
    >
      Imprimir / Guardar PDF
    </Button>
  );
}
