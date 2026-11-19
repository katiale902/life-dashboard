const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const { join } = require('node:path');

const source = readFileSync(join(__dirname, '../assets/dashboard-data.js'), 'utf8');
const { escapeHtml, isDashboardState } = runInNewContext(`${source}\n({ escapeHtml, isDashboardState })`);

function validBackup() {
  return {
    energy: 5,
    goals: [{ id: 'g1', name: 'Goal', area: 'personal', description: '', progress: 0 }],
    projects: [{ id: 'p1', name: 'Project', goalId: 'g1', description: 'A project' }],
    tasks: [{ id: 't1', goalId: 'g1', name: 'Task', done: false, time: 25, date: '2026-01-01' }],
    events: [{ id: 'e1', title: 'Event', date: '2026-01-01', time: '09:00' }],
    history: []
  };
}

test('escapes text and attribute delimiters without losing their meaning', () => {
  assert.equal(escapeHtml(`<img src="x" onerror='bad'>&`), '&lt;img src=&quot;x&quot; onerror=&#39;bad&#39;&gt;&amp;');
});

test('accepts current exports and empty collections', () => {
  assert.equal(isDashboardState(validBackup()), true);
  assert.equal(isDashboardState({ energy: 5, goals: [], projects: [], tasks: [], events: [], history: [] }), true);
});

test('rejects malformed or incomplete backups instead of accepting data that cannot render', () => {
  assert.equal(isDashboardState(null), false);
  assert.equal(isDashboardState({}), false);
  const backup = validBackup();
  backup.tasks[0].done = 'yes';
  assert.equal(isDashboardState(backup), false);
  backup.tasks[0].done = false;
  backup.goals[0].progress = '<img>';
  assert.equal(isDashboardState(backup), false);
});
