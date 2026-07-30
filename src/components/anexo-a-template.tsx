import { getFrameworkByKey, describeDuaSupports } from "@/lib/mep/pedagogical-frameworks";

export type AnexoAData = {
  title: string;
  unit?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  direccionRegional?: string | null;
  centroEducativo?: string | null;
  docente?: string | null;
  asignatura?: string | null;
  nivelCiclo?: string | null;
  periodicidad?: string | null;
  cursoLectivo?: number | null;
  competencias?: string | null;
  institutionalContext?: string | null;
  socialContext?: string | null;
  groupCharacteristics?: string | null;
  learningStyles?: string | null;
  duaSupports?: string[] | null;
  specialEducationNeeds?: string | null;
  pedagogicalApproach?: string | null;
  objectives: string;
  strategies: string;
  evaluationCriteria: string;
  resources?: string | null;
  reflection?: string | null;
  notes?: string | null;
};

function AdminRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col border border-border p-2.5">
      <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="text-foreground font-medium">{value}</span>
    </div>
  );
}

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6 last:mb-0">
      <h2 className="text-lg font-bold text-foreground mb-2 border-b-2 border-primary pb-1">
        {number}. {title}
      </h2>
      {children}
    </section>
  );
}

/** Renderiza un planeamiento en el formato de la Plantilla Oficial Anexo A - DDC/MEP. */
export function AnexoATemplate({ plan }: { plan: AnexoAData }) {
  const framework = getFrameworkByKey(plan.pedagogicalApproach);
  const duaLabels = describeDuaSupports(plan.duaSupports ?? []);

  return (
    <div className="text-foreground">
      <header className="mb-6 text-center">
        <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Ministerio de Educación Pública — Plantilla Oficial de Planeamiento Didáctico Anexo A
        </p>
        <h1 className="text-2xl font-bold mt-1">{plan.title}</h1>
        {plan.unit && <p className="text-lg text-muted-foreground">{plan.unit}</p>}
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 mb-6 rounded-lg overflow-hidden border border-border">
        <AdminRow label="Dirección Regional" value={plan.direccionRegional} />
        <AdminRow label="Centro Educativo" value={plan.centroEducativo} />
        <AdminRow label="Docente" value={plan.docente} />
        <AdminRow label="Asignatura" value={plan.asignatura} />
        <AdminRow label="Nivel / Ciclo" value={plan.nivelCiclo} />
        <AdminRow label="Periodicidad" value={plan.periodicidad} />
        <AdminRow label="Curso Lectivo" value={plan.cursoLectivo ? String(plan.cursoLectivo) : null} />
        <AdminRow
          label="Fechas"
          value={
            plan.startDate || plan.endDate
              ? `${plan.startDate?.toLocaleDateString("es-CR") ?? "—"} al ${plan.endDate?.toLocaleDateString("es-CR") ?? "—"}`
              : null
          }
        />
        <AdminRow label="Modelo pedagógico MEP" value={framework?.label} />
      </div>

      {plan.competencias && (
        <Section number="I" title="Competencia(s) General(es) del Periodo">
          <p className="whitespace-pre-wrap">{plan.competencias}</p>
        </Section>
      )}

      {(plan.institutionalContext || plan.socialContext) && (
        <Section number="II" title="Contextualización Institucional y Social">
          {plan.institutionalContext && (
            <div className="mb-3">
              <p className="font-semibold">Contexto institucional</p>
              <p className="whitespace-pre-wrap">{plan.institutionalContext}</p>
            </div>
          )}
          {plan.socialContext && (
            <div>
              <p className="font-semibold">Contexto social y comunitario</p>
              <p className="whitespace-pre-wrap">{plan.socialContext}</p>
            </div>
          )}
        </Section>
      )}

      {(plan.groupCharacteristics || plan.learningStyles || duaLabels.length > 0 || plan.specialEducationNeeds) && (
        <Section number="III" title="Contextualización de Aula y Diversidad">
          {plan.groupCharacteristics && (
            <div className="mb-3">
              <p className="font-semibold">Características del grupo</p>
              <p className="whitespace-pre-wrap">{plan.groupCharacteristics}</p>
            </div>
          )}
          {plan.learningStyles && (
            <div className="mb-3">
              <p className="font-semibold">Estilos y ritmos de aprendizaje</p>
              <p className="whitespace-pre-wrap">{plan.learningStyles}</p>
            </div>
          )}
          {duaLabels.length > 0 && (
            <div className="mb-3">
              <p className="font-semibold">Apoyos DUA aplicados</p>
              <ul className="list-disc pl-5">
                {duaLabels.map((d, i) => (
                  <li key={i}>
                    <strong>{d.principle}:</strong> {d.text}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {plan.specialEducationNeeds && (
            <div>
              <p className="font-semibold">Adecuaciones curriculares</p>
              <p className="whitespace-pre-wrap">{plan.specialEducationNeeds}</p>
            </div>
          )}
        </Section>
      )}

      <Section number="IV" title="Aprendizajes Esperados">
        <p className="whitespace-pre-wrap">{plan.objectives}</p>
      </Section>

      <Section number="V" title="Estrategias de Mediación Pedagógica">
        <p className="whitespace-pre-wrap">{plan.strategies}</p>
      </Section>

      <Section number="VI" title="Indicadores de Evaluación">
        <p className="whitespace-pre-wrap">{plan.evaluationCriteria}</p>
      </Section>

      {plan.resources && (
        <Section number="VII" title="Recursos y Materiales">
          <p className="whitespace-pre-wrap">{plan.resources}</p>
        </Section>
      )}

      {plan.reflection && (
        <Section number="VIII" title="Reflexión Docente">
          <p className="whitespace-pre-wrap">{plan.reflection}</p>
        </Section>
      )}

      {plan.notes && (
        <Section number="IX" title="Notas Adicionales">
          <p className="whitespace-pre-wrap">{plan.notes}</p>
        </Section>
      )}
    </div>
  );
}
