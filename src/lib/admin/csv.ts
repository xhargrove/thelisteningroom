type CsvValue = string | number | boolean | null | undefined;

function escapeCsvCell(value: CsvValue): string {
  if (value === null || value === undefined) {
    return "";
  }

  const raw = String(value);
  if (/[",\n\r]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

export function buildCsv<T extends Record<string, CsvValue>>(
  rows: T[],
  columns: readonly (keyof T)[],
): string {
  const header = columns.map((col) => escapeCsvCell(String(col))).join(",");
  const body = rows
    .map((row) => columns.map((col) => escapeCsvCell(row[col])).join(","))
    .join("\n");
  return body ? `${header}\n${body}` : header;
}

export function csvResponse(filename: string, csv: string): Response {
  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
