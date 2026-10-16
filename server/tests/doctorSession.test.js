const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');
const routes = require('../routes/doctorRoutes');

const originalFind = Doctor.findById;
const previousDoctorSecret = process.env.DOCTOR_SECRET;
const doctorId = '507f1f77bcf86cd799439011';
let server;
let base;
let databaseUnavailable = false;

before(async () => {
  process.env.DOCTOR_SECRET = 'doctor-session-test-secret';
  Doctor.findById = id => ({ select: async () => {
    if (databaseUnavailable) throw new Error('Temporary database outage');
    return id === doctorId ? { _id: doctorId, firstName: 'Test', lastName: 'Doctor' } : null;
  } });
  const app = express();
  app.use('/api/doctor', routes);
  server = await new Promise(resolve => {
    const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
  });
  base = `http://127.0.0.1:${server.address().port}/api/doctor/me`;
});

after(async () => {
  if (previousDoctorSecret === undefined) delete process.env.DOCTOR_SECRET;
  else process.env.DOCTOR_SECRET = previousDoctorSecret;
  Doctor.findById = originalFind;
  if (server) await new Promise(resolve => server.close(resolve));
});

const profile = payload => fetch(base, { headers: { Authorization: `Bearer ${jwt.sign(payload, process.env.DOCTOR_SECRET)}` } });

test('a token for a removed doctor is an invalid session, not a retryable missing profile', async () => {
  const response = await profile({ id: '507f1f77bcf86cd799439012' });
  assert.equal(response.status, 401);
  assert.equal((await response.json()).code, 'DOCTOR_SESSION_INVALID');
});

test('malformed doctor identity is rejected before querying the database', async () => {
  const response = await profile({ id: 'not-a-doctor-id' });
  assert.equal(response.status, 401);
});

test('a current doctor token returns its authoritative account ID', async () => {
  const response = await profile({ id: doctorId });
  assert.equal(response.status, 200);
  assert.equal((await response.json())._id, doctorId);
});

test('temporary database failures remain retryable and are not reported as invalid sessions', async () => {
  databaseUnavailable = true;
  try {
    const response = await profile({ id: doctorId });
    assert.equal(response.status, 500);
    assert.equal((await response.json()).code, undefined);
  } finally { databaseUnavailable = false; }
});
