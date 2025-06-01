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

export async function splitPdfBySize(data, sizeBytes) {
  const limit = Math.max(1, Math.floor(sizeBytes))
  const pdfDoc = await PDFDocument.load(data)
  const totalPages = pdfDoc.getPageCount()
  const result = []

  let index = 0
  while (index < totalPages) {
    const newDoc = await PDFDocument.create()
    let bytes = null
    let pagesAdded = 0

    while (index < totalPages) {
      const [page] = await newDoc.copyPages(pdfDoc, [index])
      newDoc.addPage(page)
      pagesAdded++
      bytes = await newDoc.save()

      if (bytes.byteLength > limit) {
        if (pagesAdded > 1) {
          newDoc.removePage(newDoc.getPageCount() - 1)
          bytes = await newDoc.save()
          result.push(new Uint8Array(bytes))
          pagesAdded--
        } else {
          result.push(new Uint8Array(bytes))
          index++
        }
        break
      }

      index++
      if (index >= totalPages) {
        result.push(new Uint8Array(bytes))
        break
      }
    }

    if (pagesAdded === 0) {
      // ensure progress to avoid infinite loop when a single page exceeds limit
      index++
    }
  }

  return result
}
