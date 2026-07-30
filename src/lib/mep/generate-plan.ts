import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { getFrameworkByKey, guessFrameworkKey, DUA_GUIDELINES } from "@/lib/mep/pedagogical-frameworks";

export const isClaudeConfigured = Boolean(process.env.ANTHROPIC_API_KEY);

const client = isClaudeConfigured ? new Anthropic() : null;

const GenerationSchema = z.object({
  objectives: z
    .string()
    .describe("Aprendizajes esperados / objetivos de aprendizaje, redactados de forma clara y medible."),
  strategies: z
    .string()
    .describe(
      "Estrategias de mediación pedagógica, organizadas explícitamente según los momentos del modelo pedagógico indicado."
    ),
  evaluationCriteria: z
    .string()
    .describe("Indicadores/criterios de evaluación, alineados a los aprendizajes esperados."),
  resources: z.string().describe("Recursos y materiales didácticos sugeridos, acordes al contexto institucional."),
  reflection: z
    .string()
    .describe("Breve reflexión docente sugerida sobre los posibles resultados y ajustes del planeamiento."),
});

export type MepGenerationResult = z.infer<typeof GenerationSchema>;

export type MepPlanInput = {
  title: string;
  unit?: string | null;
  asignatura?: string | null;
  nivelCiclo?: string | null;
  periodicidad?: string | null;
  competencias?: string | null;
  institutionalContext?: string | null;
  socialContext?: string | null;
  groupCharacteristics?: string | null;
  learningStyles?: string | null;
  duaSupports?: string[] | null;
  specialEducationNeeds?: string | null;
  referenceDocuments?: { type: string; fileName: string; extractedText: string | null }[];
};

function buildSystemPrompt(frameworkKey: string) {
  const framework = getFrameworkByKey(frameworkKey);
  const momentsList = framework?.moments.map((m, i) => `${i + 1}. ${m}`).join("\n") ?? "";

  return `Eres un asesor pedagógico costarricense experto en el diseño de planeamientos didácticos alineados a los lineamientos oficiales del Ministerio de Educación Pública (MEP) de Costa Rica, según la circular DVM-AC-CIR-0003-02-2026 y la Plantilla Oficial de Planeamiento Didáctico Anexo A - DDC/MEP.

Debes redactar el contenido pedagógico de un planeamiento didáctico para la asignatura/especialidad correspondiente, aplicando estrictamente el siguiente modelo pedagógico mandatado:

Modelo: ${framework?.label ?? "General"}
Enfoque: ${framework?.approach ?? ""}
${framework ? `Orientación: ${framework.guidance}` : ""}

Las Estrategias de Mediación deben organizarse explícitamente siguiendo estos momentos, en este orden, usando el nombre de cada momento como subtítulo:
${momentsList}

Reglas:
- Escribe en español costarricense, con vocabulario propio del sistema educativo (MEP, mediación pedagógica, aprendizajes esperados, indicadores de evaluación).
- Adapta el contenido al contexto institucional, social y de aula que se te brinda; no generes texto genérico.
- Si se indican apoyos DUA (Diseño Universal para el Aprendizaje) o adecuaciones curriculares, intégralos explícitamente dentro de las estrategias de mediación, no como una sección aparte.
- Si se adjuntan extractos de documentos de referencia (programa de estudio oficial, guía de competencias, material didáctico), úsalos como fuente principal de contenidos, competencias e indicadores.
- No inventes datos administrativos (nombres de personas, cédulas, direcciones); limítate al contenido pedagógico solicitado.
- La salida debe llenar los campos exactamente como se solicitan, sin texto adicional fuera del esquema.`;
}

function buildUserPrompt(input: MepPlanInput) {
  const lines: string[] = [];
  lines.push(`Título del planeamiento: ${input.title}`);
  if (input.unit) lines.push(`Unidad temática: ${input.unit}`);
  if (input.asignatura) lines.push(`Asignatura: ${input.asignatura}`);
  if (input.nivelCiclo) lines.push(`Nivel/Ciclo: ${input.nivelCiclo}`);
  if (input.periodicidad) lines.push(`Periodicidad: ${input.periodicidad}`);
  if (input.competencias) lines.push(`Competencia(s) general(es) del periodo: ${input.competencias}`);

  if (input.institutionalContext) {
    lines.push(`\nContexto institucional (infraestructura, conectividad, recursos tecnológicos):\n${input.institutionalContext}`);
  }
  if (input.socialContext) {
    lines.push(`\nContexto social/comunitario:\n${input.socialContext}`);
  }
  if (input.groupCharacteristics) {
    lines.push(`\nCaracterísticas del grupo (matrícula, género, clima de aula):\n${input.groupCharacteristics}`);
  }
  if (input.learningStyles) {
    lines.push(`\nEstilos y ritmos de aprendizaje del grupo:\n${input.learningStyles}`);
  }
  if (input.duaSupports && input.duaSupports.length > 0) {
    const labels = input.duaSupports
      .map((key) => {
        const [principle, index] = key.split(":");
        const guidelines = DUA_GUIDELINES[principle as keyof typeof DUA_GUIDELINES];
        const idx = Number(index);
        return guidelines && !Number.isNaN(idx) ? (guidelines[idx] as string | undefined) : undefined;
      })
      .filter((v): v is string => Boolean(v));
    if (labels.length > 0) {
      lines.push(`\nApoyos DUA seleccionados a integrar en la mediación:\n- ${labels.join("\n- ")}`);
    }
  }
  if (input.specialEducationNeeds) {
    lines.push(`\nAdecuaciones curriculares / necesidades educativas especiales a considerar:\n${input.specialEducationNeeds}`);
  }

  if (input.referenceDocuments && input.referenceDocuments.length > 0) {
    for (const doc of input.referenceDocuments) {
      if (!doc.extractedText) continue;
      const excerpt = doc.extractedText.slice(0, 12000);
      lines.push(`\nExtracto de documento de referencia (${doc.type} — ${doc.fileName}):\n${excerpt}`);
    }
  }

  lines.push(
    "\nCon base en lo anterior, redacta los aprendizajes esperados, las estrategias de mediación (organizadas por momento del modelo pedagógico), los indicadores/criterios de evaluación, los recursos sugeridos y una breve reflexión docente."
  );

  return lines.join("\n");
}

/** Genera el contenido pedagógico de un planeamiento usando Claude, según el modelo del MEP para la asignatura. */
export async function generateMepLessonPlan(input: MepPlanInput): Promise<{
  frameworkKey: string;
  result: MepGenerationResult;
}> {
  if (!client) {
    throw new Error(
      "La generación con IA no está configurada. Agregue ANTHROPIC_API_KEY en las variables de entorno."
    );
  }

  const frameworkKey = guessFrameworkKey(input.asignatura ?? input.title);

  const response = await client.messages.parse({
    model: "claude-opus-5",
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    output_config: { effort: "high", format: zodOutputFormat(GenerationSchema) },
    system: buildSystemPrompt(frameworkKey),
    messages: [{ role: "user", content: buildUserPrompt(input) }],
  });

  if (!response.parsed_output) {
    throw new Error("Claude no devolvió una respuesta válida. Intente de nuevo.");
  }

  return { frameworkKey, result: response.parsed_output };
}
