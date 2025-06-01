import { PDFDocument } from 'pdf-lib'

/**
 * Split a PDF into roughly equal parts by page count.
 * Each returned Uint8Array represents a valid PDF document.
 */
export async function splitPdfEqual(data, parts) {
  const pdfDoc = await PDFDocument.load(data)
  const totalPages = pdfDoc.getPageCount()
  const n = Math.max(1, Math.floor(parts))
  const pagesPerPart = Math.ceil(totalPages / n)

  const result = []
  for (let start = 0; start < totalPages; start += pagesPerPart) {
    const end = Math.min(start + pagesPerPart, totalPages)
    const newDoc = await PDFDocument.create()
    const indices = []
    for (let i = start; i < end; i++) indices.push(i)
    const pages = await newDoc.copyPages(pdfDoc, indices)
    pages.forEach(p => newDoc.addPage(p))
    const bytes = await newDoc.save()
    result.push(new Uint8Array(bytes))
  }
  return result
}

export function splitPdfBySize(data, sizeBytes) {
  const result = []
  const chunk = Math.max(1, Math.floor(sizeBytes))
  let offset = 0
  while (offset < data.length) {
    const end = Math.min(offset + chunk, data.length)
    result.push(data.slice(offset, end))
    offset += chunk
  }
  return result
}
