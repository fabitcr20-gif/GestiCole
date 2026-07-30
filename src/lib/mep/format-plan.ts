import type { LessonPlan, Section } from "@prisma/client";
import { getFrameworkByKey, describeDuaSupports } from "@/lib/mep/pedagogical-frameworks";

export type PlanTextSection = { heading: string; body: string };

/** Construye las secciones de texto de un planeamiento (Anexo A) para exportar a Drive/Docs. */
export function buildLessonPlanSections(
  plan: LessonPlan & { section?: Section | null },
  teacherName: string | null
): PlanTextSection[] {
  const framework = getFrameworkByKey(plan.pedagogicalApproach);
  const duaLabels = describeDuaSupports((plan.duaSupports as string[] | null) ?? []);

  const sections: PlanTextSection[] = [
    {
      heading: "Datos administrativos",
      body: [
        `Dirección Regional: ${plan.direccionRegional ?? "—"}`,
        `Centro Educativo: ${plan.centroEducativo ?? "—"}`,
        `Docente: ${teacherName ?? "—"}`,
        `Asignatura: ${plan.asignatura ?? plan.section?.subject ?? "—"}`,
        `Nivel / Ciclo: ${plan.nivelCiclo ?? "—"}`,
        `Periodicidad: ${plan.periodicidad ?? "—"}`,
        `Curso Lectivo: ${plan.cursoLectivo ?? "—"}`,
        `Modelo Pedagógico MEP: ${framework?.label ?? "—"}`,
      ].join("\n"),
    },
  ];

  if (plan.competencias) sections.push({ heading: "Competencia(s) General(es) del Periodo", body: plan.competencias });
  if (plan.institutionalContext) sections.push({ heading: "Contexto Institucional", body: plan.institutionalContext });
  if (plan.socialContext) sections.push({ heading: "Contexto Social y Comunitario", body: plan.socialContext });
  if (plan.groupCharacteristics) sections.push({ heading: "Características del Grupo", body: plan.groupCharacteristics });
  if (plan.learningStyles) sections.push({ heading: "Estilos y Ritmos de Aprendizaje", body: plan.learningStyles });
  if (duaLabels.length > 0) {
    sections.push({
      heading: "Apoyos DUA Aplicados",
      body: duaLabels.map((d) => `• ${d.principle}: ${d.text}`).join("\n"),
    });
  }
  if (plan.specialEducationNeeds) sections.push({ heading: "Adecuaciones Curriculares", body: plan.specialEducationNeeds });

  sections.push({ heading: "Aprendizajes Esperados", body: plan.objectives });
  sections.push({ heading: "Estrategias de Mediación Pedagógica", body: plan.strategies });
  sections.push({ heading: "Indicadores de Evaluación", body: plan.evaluationCriteria });
  if (plan.resources) sections.push({ heading: "Recursos y Materiales", body: plan.resources });
  if (plan.reflection) sections.push({ heading: "Reflexión Docente", body: plan.reflection });
  if (plan.notes) sections.push({ heading: "Notas Adicionales", body: plan.notes });

  return sections;
}

/** Convierte las secciones a texto plano, para respaldos .txt en Drive. */
export function formatLessonPlanAsText(plan: LessonPlan & { section?: Section | null }, teacherName: string | null): string {
  const sections = buildLessonPlanSections(plan, teacherName);
  return [plan.title, plan.unit ?? "", "", ...sections.flatMap((s) => [s.heading.toUpperCase(), s.body, ""])].join("\n");
}
