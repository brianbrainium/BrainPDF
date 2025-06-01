export function splitPdfEqual(data, parts) {
  const result = []
  const n = Math.max(1, Math.floor(parts))
  const partSize = Math.ceil(data.length / n)
  for (let i = 0; i < n; i++) {
    const start = i * partSize
    if (start >= data.length) break
    const end = Math.min(start + partSize, data.length)
    result.push(data.slice(start, end))
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
