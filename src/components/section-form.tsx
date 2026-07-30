import { Save } from "lucide-react";
import { FormField, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const COLORS = ["#2563eb", "#15803d", "#b91c1c", "#b45309", "#7c3aed", "#0891b2"];

export function SectionForm({
  action,
  defaultValues,
}: {
  action: (formData: FormData) => void;
  defaultValues?: {
    name?: string;
    subject?: string;
    level?: string;
    color?: string;
  };
}) {
  return (
    <Card className="p-6 max-w-xl">
      <form action={action} className="flex flex-col gap-5">
        <FormField
          label="Nombre de la sección"
          htmlFor="name"
          hint='Por ejemplo: "7-2" o "Décimo B"'
        >
          <Input
            id="name"
            name="name"
            required
            defaultValue={defaultValues?.name}
            placeholder="7-2"
          />
        </FormField>

        <FormField label="Materia" htmlFor="subject">
          <Input
            id="subject"
            name="subject"
            required
            defaultValue={defaultValues?.subject}
            placeholder="Matemática"
          />
        </FormField>

        <FormField label="Nivel (opcional)" htmlFor="level">
          <Input
            id="level"
            name="level"
            defaultValue={defaultValues?.level}
            placeholder="Sétimo año"
          />
        </FormField>

        <fieldset>
          <legend className="text-base font-semibold text-foreground mb-2">
            Color identificador
          </legend>
          <div className="flex gap-3">
            {COLORS.map((color) => (
              <label key={color} className="cursor-pointer">
                <input
                  type="radio"
                  name="color"
                  value={color}
                  defaultChecked={
                    (defaultValues?.color ?? COLORS[0]) === color
                  }
                  className="sr-only peer"
                />
                <span
                  className="block h-9 w-9 rounded-full border-2 border-transparent peer-checked:border-foreground peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-primary"
                  style={{ backgroundColor: color }}
                />
              </label>
            ))}
          </div>
        </fieldset>

        <Button type="submit" size="lg" icon={<Save size={22} aria-hidden />}>
          Guardar Cambios
        </Button>
      </form>
    </Card>
  );
}
