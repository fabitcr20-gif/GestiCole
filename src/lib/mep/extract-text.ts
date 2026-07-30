import { getDocumentProxy, extractText } from "unpdf";

const MAX_EXTRACTED_CHARS = 40000;

/** Extrae texto de un PDF o archivo de texto plano para usarlo como contexto de la IA. */
export async function extractTextFromFile(buffer: Buffer, mimeType: string): Promise<string> {
  let text: string;

  if (mimeType === "application/pdf") {
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const result = await extractText(pdf, { mergePages: true });
    text = result.text;
  } else {
    text = buffer.toString("utf-8");
  }

  return text.slice(0, MAX_EXTRACTED_CHARS);
}
