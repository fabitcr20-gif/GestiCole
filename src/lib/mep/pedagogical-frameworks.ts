/**
 * Modelos pedagógicos mandatados por el MEP (circular DVM-AC-CIR-0003-02-2026)
 * por asignatura/especialidad. Cada marco describe el enfoque y los
 * momentos/pasos que el motor de generación debe respetar al redactar las
 * Estrategias de Mediación y los Indicadores de Evaluación.
 */
export type PedagogicalFramework = {
  key: string;
  label: string;
  approach: string;
  moments: string[];
  guidance: string;
};

export const PEDAGOGICAL_FRAMEWORKS: PedagogicalFramework[] = [
  {
    key: "preescolar",
    label: "Educación Preescolar",
    approach: "Modelo pedagógico desarrollista y enfoque constructivista",
    moments: [
      "Recibimiento",
      "Opción de Trabajo",
      "Alimentación e Higiene",
      "Actividad Física",
      "Fortalecimiento Integral",
      "Expresión Artística/Cierre",
    ],
    guidance:
      "Enfocar las estrategias en la estimulación oportuna y el desarrollo humano integral, organizando la mediación según las 6 experiencias de la jornada diaria.",
  },
  {
    key: "matematicas",
    label: "Matemáticas (I, II, III Ciclo y Diversificada)",
    approach: "Aprendizaje Basado en la Resolución de Problemas (ABP)",
    moments: [
      "Propuesta de la situación problema",
      "Trabajo estudiantil independiente",
      "Discusión y confrontación grupal",
      "Institucionalización del concepto por parte del docente",
    ],
    guidance:
      "Seguir estrictamente los 4 pasos rígidos del ABP matemático en el orden indicado, sin omitir la institucionalización final.",
  },
  {
    key: "ciencias",
    label: "Ciencias / Biología, Física y Química",
    approach: "Aprendizaje por Indagación Científica",
    moments: ["Focalización", "Exploración", "Reflexión/Contrastación", "Aplicación"],
    guidance:
      "Redactar la mediación en los 4 momentos esenciales de la indagación científica, promoviendo preguntas investigables.",
  },
  {
    key: "espanol_i_ii",
    label: "Español (I y II Ciclo)",
    approach: "Enfoque Comunicativo y Funcional",
    moments: ["Contextualización comunicativa", "Producción/comprensión textual", "Reflexión sobre el uso de la lengua"],
    guidance: "Centrar la mediación en situaciones comunicativas auténticas y funcionales para el ciclo.",
  },
  {
    key: "espanol_iii_div",
    label: "Español (III Ciclo y Diversificada)",
    approach: "Análisis Crítico del Discurso y Proyectos Críticos",
    moments: ["Problematización del discurso", "Análisis crítico", "Producción de proyecto crítico"],
    guidance: "Priorizar el análisis crítico de discursos y la construcción de proyectos con posicionamiento crítico del estudiantado.",
  },
  {
    key: "estudios_sociales",
    label: "Estudios Sociales y Educación Cívica",
    approach: "Aprendizaje Crítico e Indagatorio",
    moments: ["Pregunta problematizadora", "Eje temático generador", "Indagación/Proyecto sociopolítico", "Posicionamiento crítico"],
    guidance: "Basar la mediación en preguntas problematizadoras y ejes temáticos generadores, integrando ABP sobre problemáticas sociopolíticas.",
  },
  {
    key: "lenguas_extranjeras",
    label: "Lenguas Extranjeras (Inglés / Francés / Italiano / Alemán)",
    approach: "Enfoque Basado en la Acción (Action-Oriented Approach, MCER)",
    moments: ["Escenario/tarea real", "Movilización de recursos lingüísticos", "Realización de la tarea", "Reflexión sobre el desempeño"],
    guidance: "Diseñar la mediación alrededor de escenarios y tareas lingüísticas reales alineadas al MCER.",
  },
  {
    key: "informatica",
    label: "Informática Educativa / Innovación Tecnológica (PRACTICE)",
    approach: "Aprendizaje Basado en Retos (ABR) y Pensamiento de Diseño",
    moments: ["Reto/desafío", "Empatizar y definir", "Idear y prototipar", "Probar y reflexionar"],
    guidance: "Estructurar la mediación como un reto a resolver siguiendo las fases del Design Thinking.",
  },
  {
    key: "artes",
    label: "Artes Plásticas y Educación Musical",
    approach: "Aprendizaje Creativo, Expresivo y Apreciación Estética",
    moments: ["Exploración sensorial", "Creación/ejecución (\"aprender haciendo\")", "Apreciación y reflexión estética"],
    guidance: "Priorizar la experimentación y la creación directa del estudiantado, con espacio de apreciación estética al cierre.",
  },
  {
    key: "educacion_fisica",
    label: "Educación Física",
    approach: "Aprendizaje Motor, Convivencial, Cooperativo y Autocuidado",
    moments: ["Explicación/Ejemplificación", "Práctica Guiada", "Crear/Compartir", "Reflexión/Reforzamiento"],
    guidance: "Seguir la secuencia de 4 momentos, promoviendo convivencia, cooperación y autocuidado corporal.",
  },
  {
    key: "hogar_industriales",
    label: "Educación para el Hogar y Artes Industriales",
    approach: "Aprendizaje Vivencial, Técnico y Proyectos Prácticos",
    moments: ["Fundamentación técnica", "Ejecución vivencial del proyecto", "Evaluación del producto/proceso"],
    guidance: "Centrar la mediación en proyectos prácticos con base técnica y ejecución vivencial.",
  },
  {
    key: "etp",
    label: "Educación Técnica Profesional (ETP)",
    approach: "Modelo de Competencias Laborales, ABP y Aprendizaje Vivencial en la Empresa",
    moments: ["Situación laboral/problema", "Desarrollo de competencia técnica", "Vinculación con el sector productivo", "Evaluación de desempeño"],
    guidance: "Vincular la mediación con competencias laborales reales y, cuando aplique, con experiencia en la empresa.",
  },
  {
    key: "epja",
    label: "Educación de Jóvenes y Adultos (EPJA - CINDEA, IPEC, CONED, Nocturnos)",
    approach: "Principios Andragógicos, Enfoque Socioconstructivista, Aprendizaje Experiencial y Autónomo",
    moments: ["Reconocimiento de saberes previos", "Aprendizaje experiencial modular", "Autonomía y aplicación flexible"],
    guidance: "Aplicar principios andragógicos, valorando la experiencia previa de la persona adulta y la flexibilidad curricular modular.",
  },
];

export function getFrameworkByKey(key: string | null | undefined) {
  return PEDAGOGICAL_FRAMEWORKS.find((f) => f.key === key) ?? null;
}

/** Intenta adivinar el marco pedagógico a partir del nombre de la asignatura. */
export function guessFrameworkKey(subject: string): string {
  const s = subject.toLowerCase();
  if (s.includes("preescolar") || s.includes("materno")) return "preescolar";
  if (s.includes("matemát") || s.includes("matemat")) return "matematicas";
  if (s.includes("ciencia") || s.includes("biolog") || s.includes("física") || s.includes("fisica") || s.includes("química") || s.includes("quimica"))
    return "ciencias";
  if (s.includes("español") || s.includes("espanol")) return "espanol_i_ii";
  if (s.includes("social") || s.includes("cívica") || s.includes("civica")) return "estudios_sociales";
  if (s.includes("inglés") || s.includes("ingles") || s.includes("francés") || s.includes("frances") || s.includes("italiano") || s.includes("alemán") || s.includes("aleman"))
    return "lenguas_extranjeras";
  if (s.includes("informát") || s.includes("informat") || s.includes("tecnolog")) return "informatica";
  if (s.includes("arte") || s.includes("música") || s.includes("musica")) return "artes";
  if (s.includes("física educativa") || s.includes("educación física") || s.includes("educacion fisica")) return "educacion_fisica";
  if (s.includes("hogar") || s.includes("industrial")) return "hogar_industriales";
  if (s.includes("técnic") || s.includes("tecnic")) return "etp";
  if (s.includes("adulto") || s.includes("cindea") || s.includes("ipec") || s.includes("coned") || s.includes("nocturn")) return "epja";
  return "estudios_sociales";
}

export const DUA_GUIDELINES = {
  representacion: [
    "Proporcionar opciones de percepción (formatos visuales, auditivos, táctiles)",
    "Proporcionar opciones de lenguaje y símbolos (vocabulario, notación, glosarios)",
    "Proporcionar opciones de comprensión (activar conocimientos previos, resaltar ideas clave)",
  ],
  accionExpresion: [
    "Proporcionar opciones para la acción física (formatos de respuesta variados)",
    "Proporcionar opciones para la expresión y comunicación (múltiples medios: oral, escrito, gráfico)",
    "Proporcionar opciones para las funciones ejecutivas (metas, planificación, autorregulación)",
  ],
  implicacionMotivacion: [
    "Proporcionar opciones para captar el interés (relevancia, elección, autonomía)",
    "Proporcionar opciones para mantener el esfuerzo y la persistencia (metas claras, colaboración)",
    "Proporcionar opciones para la autorregulación (expectativas, afrontamiento, autoevaluación)",
  ],
} as const;

export const NIVELES_CICLO = [
  "Preescolar",
  "I Ciclo",
  "II Ciclo",
  "III Ciclo",
  "Educación Diversificada",
  "Educación Técnica Profesional (ETP)",
  "EPJA (CINDEA/IPEC/CONED/Nocturno)",
] as const;

export const PERIODICIDADES = ["Semanal", "Quincenal", "Mensual", "Trimestral", "Semestral", "Anual"] as const;

const DUA_PRINCIPLE_LABELS: Record<keyof typeof DUA_GUIDELINES, string> = {
  representacion: "Representación",
  accionExpresion: "Acción y Expresión",
  implicacionMotivacion: "Implicación y Motivación",
};

/** Convierte claves "principio:índice" guardadas en duaSupports a texto legible. */
export function describeDuaSupports(keys: string[]): { principle: string; text: string }[] {
  return keys
    .map((key) => {
      const [principle, index] = key.split(":");
      const guidelines = DUA_GUIDELINES[principle as keyof typeof DUA_GUIDELINES];
      const idx = Number(index);
      if (!guidelines || Number.isNaN(idx) || !guidelines[idx]) return null;
      return {
        principle: DUA_PRINCIPLE_LABELS[principle as keyof typeof DUA_GUIDELINES],
        text: guidelines[idx] as string,
      };
    })
    .filter((v): v is { principle: string; text: string } => v !== null);
}
