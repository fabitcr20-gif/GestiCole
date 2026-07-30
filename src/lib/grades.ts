export type ComponentWeight = { id: string; weight: number };
export type ScoreMap = Map<string, number | null | undefined>;

export type WeightedResult = {
  /** Promedio ponderado (0-100), o null si no hay ninguna nota registrada. */
  average: number | null;
  /** true si todos los rubros configurados ya tienen nota. */
  isComplete: boolean;
  /** Suma de los porcentajes configurados (debería ser 100). */
  totalWeight: number;
};

/**
 * Calcula el promedio ponderado de un estudiante usando únicamente los
 * rubros que ya tienen nota registrada (normalizando sobre el peso de esos
 * rubros), de forma que el docente vea un promedio "en curso" útil incluso
 * antes de terminar de calificar todos los rubros del periodo.
 */
export function computeWeightedAverage(
  components: ComponentWeight[],
  scores: ScoreMap
): WeightedResult {
  const totalWeight = components.reduce((sum, c) => sum + c.weight, 0);

  const graded = components.filter((c) => {
    const score = scores.get(c.id);
    return score !== null && score !== undefined;
  });

  if (graded.length === 0) {
    return { average: null, isComplete: false, totalWeight };
  }

  const gradedWeight = graded.reduce((sum, c) => sum + c.weight, 0);
  const weightedSum = graded.reduce((sum, c) => {
    const score = scores.get(c.id) ?? 0;
    return sum + score * c.weight;
  }, 0);

  const average = gradedWeight > 0 ? weightedSum / gradedWeight : null;

  return {
    average,
    isComplete: graded.length === components.length,
    totalWeight,
  };
}

export const PERIODS = ["I", "II", "III"] as const;
export type Period = (typeof PERIODS)[number];

export const PERIOD_LABELS: Record<string, string> = {
  I: "I Periodo",
  II: "II Periodo",
  III: "III Periodo",
};
