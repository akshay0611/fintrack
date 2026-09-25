function escapeCell(value: string | number | null | undefined): string {
  const s = value === null || value === undefined ? "" : String(value)
  return `"${s.replace(/"/g, '""')}"`
}

export function toCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
  return [headers.map(escapeCell).join(","), ...rows.map((row) => row.map(escapeCell).join(","))].join("\n")
}

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}