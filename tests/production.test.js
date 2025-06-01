import test from 'node:test'
import assert from 'node:assert'
import { execSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'

const BUILD_DIR = '.output'
const GENERATE_DIR = 'docs'

test('README production steps work', async () => {
  // Build the application
  execSync('pnpm run build', { stdio: 'inherit' });
  assert.ok(fs.existsSync(BUILD_DIR), 'build output missing');

  // Generate the static site
  execSync('pnpm run generate', { stdio: 'inherit' });
  assert.ok(fs.existsSync(`${GENERATE_DIR}/index.html`), 'generated index.html missing');

  // Preview command is available
  const result = spawnSync('pnpm', ['run', 'preview', '--', '--help'], {
    stdio: 'inherit'
  })
  assert.strictEqual(result.status, 0, 'preview command failed')
});
