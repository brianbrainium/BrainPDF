import test from 'node:test'
import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

async function importTS(file) {
  const src = fs.readFileSync(path.join(file), 'utf8')
  const js = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.ES2020, target: ts.ScriptTarget.ES2019 }
  }).outputText
  const url = `data:text/javascript;base64,${Buffer.from(js).toString('base64')}`
  return import(url)
}

test('computeMaxPdfSizeMB returns half of memory rounded down', async () => {
  const { computeMaxPdfSizeMB } = await importTS('utils/memory.ts')

  assert.strictEqual(computeMaxPdfSizeMB(2048), 1024)
  assert.strictEqual(computeMaxPdfSizeMB(4096), 2048)
  assert.strictEqual(computeMaxPdfSizeMB(1023), Math.floor(1023 / 2))
  assert.strictEqual(computeMaxPdfSizeMB(512), 256)
})
