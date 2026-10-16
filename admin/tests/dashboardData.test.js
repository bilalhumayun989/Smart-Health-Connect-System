import test from 'node:test';
import assert from 'node:assert/strict';
import { dailyCounts, monthlyCounts } from '../src/components/dashboard/dashboardData.js';

test('empty collections produce zero counts without sample activity', () => {
  const now = new Date(2026, 0, 15, 12);
  assert(monthlyCounts([], [], [], now).every(m => m.patients === 0 && m.doctors === 0 && m.appointments === 0));
  assert(dailyCounts([], 28, now).every(d => d.count === 0));
});

test('monthly counts cross year boundaries and use appointment dates', () => {
  const now = new Date(2026, 0, 15, 12);
  const result = monthlyCounts(
    [{ createdAt: '2025-12-15T12:00:00' }, { createdAt: 'invalid' }],
    [{ createdAt: '2026-01-01T00:00:00' }],
    [{ createdAt: '2025-08-20T12:00:00', appointmentDate: '2026-01-01' }],
    now,
  );
  assert.equal(result.length, 6);
  assert.equal(result[0].month, 'Aug 25');
  assert.equal(result[4].patients, 1);
  assert.equal(result[5].doctors, 1);
  assert.equal(result[5].appointments, 1);
  assert.equal(result[0].appointments, 0);
});

test('daily activity includes the start and end dates and excludes future visits', () => {
  const result = dailyCounts([
    { appointmentDate: '2025-12-31' },
    { appointmentDate: '2026-01-01' },
    { appointmentDate: '2026-01-07' },
    { appointmentDate: '2026-01-07' },
    { appointmentDate: '2026-01-08' },
    {},
  ], 7, new Date(2026, 0, 7, 12));
  assert.equal(result[0].date, '2026-01-01');
  assert.equal(result[6].date, '2026-01-07');
  assert.equal(result[0].count, 1);
  assert.equal(result[6].count, 2);
  assert.equal(result.reduce((sum, d) => sum + d.count, 0), 3);
});
