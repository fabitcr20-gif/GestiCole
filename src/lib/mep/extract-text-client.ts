const MAX_EXTRACTED_CHARS = 40000;

/**
 * Extrae texto de un PDF o archivo de texto directamente en el navegador,
 * sin subir el archivo al servidor (evita el límite de tamaño de solicitud
 * de las funciones serverless de Vercel).
 */
export async function extractTextFromFileClient(file: File): Promise<string> {
  let text: string;

  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    const { getDocumentProxy, extractText } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(await file.arrayBuffer()));
    const result = await extractText(pdf, { mergePages: true });
    text = result.text;
  } else {
    text = await file.text();
  }

  return text.slice(0, MAX_EXTRACTED_CHARS);
}
