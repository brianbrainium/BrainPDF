import test from 'node:test'
import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'

const BUILD_DIR = 'docs/_nuxt'

test('refresh button code present in build', () => {
  const jsFiles = fs.readdirSync(BUILD_DIR).filter(f => f.endsWith('.js'))
  const found = jsFiles.some(f => {
    const content = fs.readFileSync(path.join(BUILD_DIR, f), 'utf8')
    return content.includes('Refresh')
  })
  assert.ok(found, 'refresh button not found in build')
})
