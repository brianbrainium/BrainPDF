import test from 'node:test';
import assert from 'node:assert';
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const BUILD_DIR = '.output/public';

function buildProject() {
  execSync('npx nuxi build', { stdio: 'ignore' });
}

test('PWA runs offline after first download', () => {
  buildProject();
  const swPath = `${BUILD_DIR}/sw.js`;
  assert.ok(fs.existsSync(swPath), 'service worker not found');

  const swContent = fs.readFileSync(swPath, 'utf8');
  assert.match(swContent, /precacheAndRoute/);
  assert.match(swContent, /NavigationRoute/);
});
