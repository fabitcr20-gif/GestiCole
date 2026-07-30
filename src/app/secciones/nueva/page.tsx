import { PageHeader } from "@/components/ui/page-header";
import { SectionForm } from "@/components/section-form";
import { createSection } from "@/lib/actions/sections";

export default function NewSectionPage() {
  return (
    <div>
      <PageHeader
        title="Nueva sección"
        description="Complete los datos básicos de su grupo. Podrá ajustar los porcentajes de notas después."
      />
      <SectionForm action={createSection} />
    </div>
  );
}
