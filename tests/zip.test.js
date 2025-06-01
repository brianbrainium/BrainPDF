import test from 'node:test'
import assert from 'node:assert'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import extract from '../node_modules/.pnpm/extract-zip@2.0.1/node_modules/extract-zip/index.js'
import ts from 'typescript'

async function importTS(file) {
  const src = fs.readFileSync(path.join(file), 'utf8')
  const js = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.ES2020, target: ts.ScriptTarget.ES2019 }
  }).outputText
  const url = `data:text/javascript;base64,${Buffer.from(js).toString('base64')}`
  return import(url)
}

test('createZip produces a valid archive', async () => {
  const { createZip } = await importTS('utils/zip.ts')

  const entries = [
    { name: 'hello.txt', data: new TextEncoder().encode('Hello') },
    { name: 'world.txt', data: new TextEncoder().encode('World') }
  ]

  const blob = createZip(entries)
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ziptest-'))
  const zipPath = path.join(tmpDir, 'archive.zip')
  const buffer = Buffer.from(await blob.arrayBuffer())
  fs.writeFileSync(zipPath, buffer)

  const outDir = path.join(tmpDir, 'out')
  fs.mkdirSync(outDir)
  await extract(zipPath, { dir: outDir })

  for (const entry of entries) {
    const filePath = path.join(outDir, entry.name)
    const content = fs.readFileSync(filePath, 'utf8')
    assert.strictEqual(content, new TextDecoder().decode(entry.data))
  }

  fs.rmSync(tmpDir, { recursive: true, force: true })
})
