import test from 'node:test'
import assert from 'node:assert'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { PDFDocument } from 'pdf-lib'

import { splitPdfEqual, splitPdfBySize } from '../utils/split.ts'

// ensure each split piece is a valid PDF and page counts add up

test('split pdf into equal parts', async () => {
  const pdfPath = path.join('samplePDFs', 'sample.pdf')
  const buffer = fs.readFileSync(pdfPath)
  const data = new Uint8Array(buffer)

  const original = await PDFDocument.load(data)
  const originalPages = original.getPageCount()

  const parts = await splitPdfEqual(data, 3)
  assert.strictEqual(parts.length, 3)

  let pageSum = 0
  for (const part of parts) {
    const doc = await PDFDocument.load(part)
    const count = doc.getPageCount()
    assert.ok(count > 0, 'part has no pages')
    pageSum += count
  }
  assert.strictEqual(pageSum, originalPages, 'page counts do not add up')
})

test('no empty chunks when requesting many parts', async () => {
  const pdfPath = path.join('samplePDFs', 'sample.pdf')
  const buffer = fs.readFileSync(pdfPath)
  const data = new Uint8Array(buffer)

  const original = await PDFDocument.load(data)
  const pages = original.getPageCount()

  const parts = await splitPdfEqual(data, pages + 5)
  assert.strictEqual(parts.length, pages)
  assert.ok(parts.every(p => p.length > 0), 'contains empty parts')
})

test('split pdf by size yields valid pdfs', async () => {
  const pdfPath = path.join('samplePDFs', 'sample.pdf')
  const buffer = fs.readFileSync(pdfPath)
  const data = new Uint8Array(buffer)

  const original = await PDFDocument.load(data)
  const originalPages = original.getPageCount()

  const parts = await splitPdfBySize(data, 300 * 1024)
  assert.ok(parts.length > 1, 'should produce multiple parts')

  let pageSum = 0
  for (const part of parts) {
    const doc = await PDFDocument.load(part)
    const count = doc.getPageCount()
    assert.ok(count > 0, 'part has no pages')
    pageSum += count
  }
  assert.strictEqual(pageSum, originalPages, 'page counts do not add up')
})

test('downloaded split pdf can be opened from disk', async () => {
  const pdfPath = path.join('samplePDFs', 'sample.pdf')
  const buffer = fs.readFileSync(pdfPath)
  const data = new Uint8Array(buffer)

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'split-'))
  const parts = await splitPdfEqual(data, 2)

  for (const [i, part] of parts.entries()) {
    const file = path.join(tmpDir, `part-${i + 1}.pdf`)
    fs.writeFileSync(file, part)
    const bytes = fs.readFileSync(file)
    const doc = await PDFDocument.load(bytes)
    const count = doc.getPageCount()
    assert.ok(count > 0, 'downloaded part has no pages')
    fs.unlinkSync(file)
  }

  fs.rmSync(tmpDir, { recursive: true, force: true })
})
