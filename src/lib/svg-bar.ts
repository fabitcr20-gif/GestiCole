/** Genera un path SVG de una barra horizontal: extremo de datos redondeado, base cuadrada. */
export function horizontalBarPath(
  x: number,
  y: number,
  width: number,
  height: number,
  radius = 4
) {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  if (width <= 0) return "";
  if (r === 0) {
    return `M${x},${y} h${width} v${height} h${-width} Z`;
  }
  return [
    `M${x},${y}`,
    `H${x + width - r}`,
    `A${r},${r} 0 0 1 ${x + width},${y + r}`,
    `V${y + height - r}`,
    `A${r},${r} 0 0 1 ${x + width - r},${y + height}`,
    `H${x}`,
    "Z",
  ].join(" ");
}

/** Path de un segmento dentro de una barra apilada: solo redondea el extremo que toca el final de la barra completa. */
export function stackedSegmentPath(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  roundLeft: boolean,
  roundRight: boolean
) {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  if (width <= 0) return "";
  if (r === 0 || (!roundLeft && !roundRight)) {
    return `M${x},${y} h${width} v${height} h${-width} Z`;
  }
  const topLeftR = roundLeft ? r : 0;
  const bottomLeftR = roundLeft ? r : 0;
  const topRightR = roundRight ? r : 0;
  const bottomRightR = roundRight ? r : 0;

  return [
    `M${x + topLeftR},${y}`,
    `H${x + width - topRightR}`,
    topRightR ? `A${topRightR},${topRightR} 0 0 1 ${x + width},${y + topRightR}` : "",
    `V${y + height - bottomRightR}`,
    bottomRightR
      ? `A${bottomRightR},${bottomRightR} 0 0 1 ${x + width - bottomRightR},${y + height}`
      : "",
    `H${x + bottomLeftR}`,
    bottomLeftR ? `A${bottomLeftR},${bottomLeftR} 0 0 1 ${x},${y + height - bottomLeftR}` : "",
    `V${y + topLeftR}`,
    topLeftR ? `A${topLeftR},${topLeftR} 0 0 1 ${x + topLeftR},${y}` : "",
    "Z",
  ]
    .filter(Boolean)
    .join(" ");
}
