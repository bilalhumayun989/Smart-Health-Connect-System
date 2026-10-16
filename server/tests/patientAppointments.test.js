const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');
const Booking = require('../models/Booking');
const bookingRoutes = require('../routes/bookingRoutes');

const patientId = '507f1f77bcf86cd799439011';
const previousSecret = process.env.JWT_SECRET;
const originalPatientFind = Patient.findById;
const originalBookingFind = Booking.find;
let server;
let baseUrl;
let query;

before(async () => {
  process.env.JWT_SECRET = 'appointment-route-test-secret';
  Patient.findById = id => ({ select: async () => id === patientId ? { _id: patientId } : null });
  Booking.find = filter => {
    query = filter;
    return { sort: async () => [{ _id: 'visit-1', patientId, doctorName: 'Dr. Test' }] };
  };
  const app = express();
  app.use('/api/appointment', bookingRoutes);
  server = await new Promise(resolve => {
    const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  Patient.findById = originalPatientFind;
  Booking.find = originalBookingFind;
  if (previousSecret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = previousSecret;
  if (server) await new Promise(resolve => server.close(resolve));
});

test('patient appointments require a valid session', async () => {
  assert.equal((await fetch(`${baseUrl}/api/appointment/patient/me`)).status, 401);
  assert.equal((await fetch(`${baseUrl}/api/appointment/patient/me`, { headers: { Authorization: 'Bearer invalid' } })).status, 401);
});

test('appointments use the signed-in patient, ignoring a supplied patient ID', async () => {
  const token = jwt.sign({ id: patientId }, process.env.JWT_SECRET);
  const response = await fetch(`${baseUrl}/api/appointment/patient/me?patientId=another-patient`, { headers: { Authorization: `Bearer ${token}` } });
  assert.equal(response.status, 200);
  assert.deepEqual(query, { patientId });
  const records = await response.json();
  assert.equal(records.length, 1);
  assert.equal(records[0].patientId, patientId);
});

test('a session for a deleted patient cannot access appointments', async () => {
  const token = jwt.sign({ id: '507f1f77bcf86cd799439012' }, process.env.JWT_SECRET);
  const response = await fetch(`${baseUrl}/api/appointment/patient/me`, { headers: { Authorization: `Bearer ${token}` } });
  assert.equal(response.status, 401);
});
