import Papa from "papaparse";
import * as XLSX from "xlsx";

export type ParsedFile = {
  headers: string[];
  rows: Record<string, string>[];
};

/**
 * Lee un archivo de estudiantes/notas en CSV, XLS, XLSX o JSON y lo
 * normaliza a una lista de filas con las mismas columnas (encabezados),
 * sin importar el formato de origen.
 */
export async function parseImportFile(file: File): Promise<ParsedFile> {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "csv") {
    return parseCsv(file);
  }
  if (extension === "xlsx" || extension === "xls") {
    return parseSpreadsheet(file);
  }
  if (extension === "json") {
    return parseJson(file);
  }
  throw new Error(
    "Formato no soportado. Use un archivo .csv, .xlsx, .xls o .json"
  );
}

function parseCsv(file: File): Promise<ParsedFile> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (result) => {
        const headers = result.meta.fields ?? [];
        resolve({ headers, rows: result.data });
      },
      error: (err: Error) => reject(err),
    });
  });
}

async function parseSpreadsheet(file: File): Promise<ParsedFile> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
    defval: "",
    raw: false,
  });
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
  return { headers, rows };
}

async function parseJson(file: File): Promise<ParsedFile> {
  const text = await file.text();
  const data = JSON.parse(text);
  const list: unknown[] = Array.isArray(data) ? data : data.students ?? data.rows ?? [];

  const rows = list.map((item) => {
    const record: Record<string, string> = {};
    if (item && typeof item === "object") {
      for (const [key, value] of Object.entries(item as Record<string, unknown>)) {
        record[key] = value === null || value === undefined ? "" : String(value);
      }
    }
    return record;
  });

  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
  return { headers, rows };
}

const NAME_HINTS = ["nombre", "name", "estudiante", "alumno"];
const CODE_HINTS = ["codigo", "código", "cedula", "cédula", "carne", "carné", "id"];
const EMAIL_HINTS = ["correo", "email", "mail"];

/** Intenta adivinar a qué campo corresponde cada columna, para precargar el mapeo. */
export function guessFieldMapping(headers: string[]) {
  const mapping: Record<string, "fullName" | "studentCode" | "email" | "ignore"> = {};
  for (const header of headers) {
    const normalized = header.toLowerCase().trim();
    if (NAME_HINTS.some((hint) => normalized.includes(hint))) {
      mapping[header] = "fullName";
    } else if (CODE_HINTS.some((hint) => normalized.includes(hint))) {
      mapping[header] = "studentCode";
    } else if (EMAIL_HINTS.some((hint) => normalized.includes(hint))) {
      mapping[header] = "email";
    } else {
      mapping[header] = "ignore";
    }
  }
  return mapping;
}
