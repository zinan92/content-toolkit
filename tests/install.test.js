'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const { resolveExecutionPath } = require('../install.js');

test('videocut prefers the canonical local workspace when present', () => {
  const resolved = resolveExecutionPath('videocut');
  assert.strictEqual(resolved, '/Users/wendy/videocut');
});

test('non-overridden capabilities still use the installed cache path', () => {
  const resolved = resolveExecutionPath('rewrite');
  assert.strictEqual(resolved, path.join(path.resolve(__dirname, '..'), 'capabilities', 'rewrite'));
});
