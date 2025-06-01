export function getAvailableMemoryMB(): number {
  const mem = (navigator as any).deviceMemory
  // navigator.deviceMemory reports in GB when available
  if (typeof mem === 'number') {
    return Math.round(mem * 1024)
  }
  // Fallback when API unsupported
  return 2048
}

export function computeMaxPdfSizeMB(totalMemMB: number): number {
  // Assume we need roughly twice the PDF size in memory for parsing
  return Math.floor(totalMemMB / 2)
}
