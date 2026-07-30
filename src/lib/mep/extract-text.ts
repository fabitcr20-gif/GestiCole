import { PDFParse } from "pdf-parse";

const MAX_EXTRACTED_CHARS = 40000;

/** Extrae texto de un PDF o archivo de texto plano para usarlo como contexto de la IA. */
export async function extractTextFromFile(buffer: Buffer, mimeType: string): Promise<string> {
  let text: string;

  if (mimeType === "application/pdf") {
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      text = result.text;
    } finally {
      await parser.destroy();
    }
  } else {
    text = buffer.toString("utf-8");
  }

  return text.slice(0, MAX_EXTRACTED_CHARS);
}
