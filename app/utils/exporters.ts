// Lightweight client-side exporters that produce real Word (.doc) and Excel (.xls)
// files without any external dependency. Word/Excel both open HTML-based payloads,
// so we wrap content with the appropriate Office namespaces and MIME types.

const escapeHtml = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const triggerDownload = (blob: Blob, filename: string) => {
  if (typeof window === 'undefined') return
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const ensureExt = (name: string, ext: string) =>
  name.toLowerCase().endsWith(ext) ? name : `${name}${ext}`

/** Build an HTML table string from headers + rows (used for Excel exports). */
export const buildTable = (headers: string[], rows: (string | number)[][]): string => {
  const head = `<tr>${headers
    .map(
      (h) =>
        `<th style="background:#1e3a8a;color:#ffffff;padding:8px;border:1px solid #b0b0b0;text-align:left;">${escapeHtml(h)}</th>`
    )
    .join('')}</tr>`
  const body = rows
    .map(
      (r) =>
        `<tr>${r
          .map((c) => `<td style="padding:6px 8px;border:1px solid #cccccc;">${escapeHtml(c)}</td>`)
          .join('')}</tr>`
    )
    .join('')
  return `<table border="1" cellspacing="0" cellpadding="0">${head}${body}</table>`
}

/** Export tabular content to an Excel-compatible .xls file. */
export const downloadExcel = (filename: string, tableHtml: string, title = '') => {
  const html =
    `<html xmlns:o="urn:schemas-microsoft-com:office:office" ` +
    `xmlns:x="urn:schemas-microsoft-com:office:excel" ` +
    `xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8" />` +
    `<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>` +
    `<x:Name>${escapeHtml(title || 'Sheet1')}</x:Name><x:WorksheetOptions><x:DisplayGridlines/>` +
    `</x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->` +
    `</head><body>${title ? `<h3>${escapeHtml(title)}</h3>` : ''}${tableHtml}</body></html>`
  const blob = new Blob(['\ufeff', html], { type: 'application/vnd.ms-excel' })
  triggerDownload(blob, ensureExt(filename, '.xls'))
}

/** Export document-style content to a Word-compatible .doc file. */
export const downloadWord = (filename: string, title: string, bodyHtml: string) => {
  const html =
    `<html xmlns:o="urn:schemas-microsoft-com:office:office" ` +
    `xmlns:w="urn:schemas-microsoft-com:office:word" ` +
    `xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8" />` +
    `<title>${escapeHtml(title)}</title>` +
    `<style>body{font-family:'Segoe UI',Arial,sans-serif;color:#1e293b;font-size:12pt;}` +
    `h1{color:#1e3a8a;font-size:20pt;margin:0 0 4pt;}h2{color:#1e3a8a;font-size:14pt;border-bottom:1px solid #e2e8f0;padding-bottom:4pt;margin-top:18pt;}` +
    `table{border-collapse:collapse;width:100%;margin:6pt 0;}td,th{border:1px solid #cccccc;padding:6px 8px;text-align:left;font-size:11pt;}` +
    `th{background:#1e3a8a;color:#ffffff;}.muted{color:#64748b;font-size:10pt;}.right{text-align:right;}</style>` +
    `</head><body>${bodyHtml}</body></html>`
  const blob = new Blob(['\ufeff', html], { type: 'application/msword' })
  triggerDownload(blob, ensureExt(filename, '.doc'))
}

/** Build a simple two-column "label / value" table for Word documents. */
export const buildInfoTable = (rows: [string, unknown][]): string =>
  `<table>${rows
    .map(
      ([label, value]) =>
        `<tr><td style="width:35%;background:#f8fafc;font-weight:bold;">${escapeHtml(label)}</td>` +
        `<td>${escapeHtml(value)}</td></tr>`
    )
    .join('')}</table>`
