import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

const BUILD_DIR = 'docs';

test('PWA runs offline after first download', () => {
  const swPath = `${BUILD_DIR}/sw.js`;
  assert.ok(fs.existsSync(swPath), 'service worker not found');

  const swContent = fs.readFileSync(swPath, 'utf8');
  assert.match(swContent, /precacheAndRoute/);
  assert.match(swContent, /NavigationRoute/);
});
