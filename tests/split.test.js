import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

function splitEqual(data, parts) {
  const partSize = Math.ceil(data.length / parts);
  const result = [];
  for (let i = 0; i < parts; i++) {
    const start = i * partSize;
    const end = Math.min(start + partSize, data.length);
    result.push(data.slice(start, end));
  }
  return result;
}

test('split pdf into equal parts', () => {
  const pdfPath = path.join('samplePDFs', 'Dynamics 365 Business Central - Connectors _ Microsoft Learn.pdf');
  const buffer = fs.readFileSync(pdfPath);
  const data = new Uint8Array(buffer);

  const parts = splitEqual(data, 3);
  assert.strictEqual(parts.length, 3);

  const totalSize = parts.reduce((sum, p) => sum + p.length, 0);
  assert.strictEqual(totalSize, data.length);

  const sizes = parts.map(p => p.length);
  const maxSize = Math.max(...sizes);
  const minSize = Math.min(...sizes);
  assert.ok(maxSize - minSize <= 1, 'parts sizes vary too much');
});
