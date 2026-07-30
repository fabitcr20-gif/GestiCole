import clsx from "clsx";

const PASSING_SCORE = 70;

export function GradeBadge({ score }: { score: number | null | undefined }) {
  if (score === null || score === undefined) {
    return (
      <span className="inline-flex items-center justify-center rounded-lg border border-border bg-slate-50 px-3 py-1 text-base font-semibold text-muted-foreground min-w-[4rem]">
        —
      </span>
    );
  }

  const passing = score >= PASSING_SCORE;
  return (
    <span
      className={clsx(
        "inline-flex items-center justify-center rounded-lg border px-3 py-1 text-base font-bold min-w-[4rem]",
        passing
          ? "bg-success-bg border-success-border text-success"
          : "bg-danger-bg border-danger-border text-danger"
      )}
    >
      {score.toFixed(1)}
    </span>
  );
}

export { PASSING_SCORE };
