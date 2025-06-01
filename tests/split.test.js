import test from 'node:test'
import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'

import { splitPdfEqual } from '../utils/split.js'

test('split pdf into equal parts', () => {
  const pdfPath = path.join('samplePDFs', 'sample.pdf');
  const buffer = fs.readFileSync(pdfPath);
  const data = new Uint8Array(buffer);

  const parts = splitPdfEqual(data, 3);
  assert.strictEqual(parts.length, 3);

  const totalSize = parts.reduce((sum, p) => sum + p.length, 0);
  assert.strictEqual(totalSize, data.length);

  const sizes = parts.map(p => p.length);
  const maxSize = Math.max(...sizes);
  const minSize = Math.min(...sizes);
  assert.ok(maxSize - minSize <= 1, 'parts sizes vary too much');

  const reconstructed = Buffer.concat(parts.map(p => Buffer.from(p)));
  assert.ok(reconstructed.equals(Buffer.from(data)), 'reconstructed pdf mismatch');
});

test('no empty chunks when requesting many parts', () => {
  const pdfPath = path.join('samplePDFs', 'sample.pdf');
  const buffer = fs.readFileSync(pdfPath);
  const data = new Uint8Array(buffer);

  const parts = splitPdfEqual(data, data.length + 5);
  assert.ok(parts.every(p => p.length > 0), 'contains empty parts');
});
