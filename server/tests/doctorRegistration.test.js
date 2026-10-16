const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const Doctor = require('../models/Doctor');
const doctorRoutes = require('../routes/doctorRoutes');

const originalFind = Doctor.findOne;
const originalSave = Doctor.prototype.save;
const originalUnlink = fs.promises.unlink;
const previousDoctorSecret = process.env.DOCTOR_SECRET;
const documentFields = ['degreeCertificate', 'licenseDocument', 'idProof'];
let server;
let baseUrl;
let duplicate;
let saved;
let removed = [];
const successfulUploads = [];

function registration(documents = documentFields, overrides = {}) {
  const form = new FormData();
  const fields = { firstName: 'Test', lastName: 'Doctor', email: 'doctor@example.test', phone: '+923001234567', password: 'test-password', specialty: 'General Medicine', licenseNumber: 'TEST-LICENSE', yearsOfExperience: '0', bio: 'Test professional biography.', ...overrides };
  for (const [key, value] of Object.entries(fields)) form.append(key, value);
  for (const field of documents) form.append(field, new Blob(['Test document'], { type: 'application/pdf' }), 'test.pdf');
  return form;
}

before(async () => {
  process.env.DOCTOR_SECRET = 'doctor-registration-test-secret';
  Doctor.findOne = async () => duplicate ? { _id: 'existing-doctor' } : null;
  Doctor.prototype.save = async function () {
    saved = this.toObject();
    successfulUploads.push(...Object.values(saved.documents).map(filename => path.join(__dirname, '../uploads/doctors', filename)));
    return this;
  };
  fs.promises.unlink = async filename => { removed.push(filename); return originalUnlink(filename); };
  const app = express();
  app.use(express.json());
  app.use('/api/doctor', doctorRoutes);
  server = await new Promise(resolve => {
    const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
  });
  baseUrl = `http://127.0.0.1:${server.address().port}/api/doctor/register`;
});

beforeEach(() => { duplicate = false; saved = null; removed = []; });

after(async () => {
  if (previousDoctorSecret === undefined) delete process.env.DOCTOR_SECRET;
  else process.env.DOCTOR_SECRET = previousDoctorSecret;
  Doctor.findOne = originalFind;
  Doctor.prototype.save = originalSave;
  fs.promises.unlink = originalUnlink;
  await Promise.all(successfulUploads.map(filename => originalUnlink(filename)));
  if (server) await new Promise(resolve => server.close(resolve));
});

test('missing verification documents return field errors instead of a server error', async () => {
  const response = await fetch(baseUrl, { method: 'POST', body: registration([]) });
  assert.equal(response.status, 400);
  const body = await response.json();
  for (const field of documentFields) assert.match(body.errors[field], /Upload your/);
  assert.equal(saved, null);
});

test('partially uploaded documents are cleaned up when registration is incomplete', async () => {
  const response = await fetch(baseUrl, { method: 'POST', body: registration(['degreeCertificate']) });
  assert.equal(response.status, 400);
  const body = await response.json();
  assert(body.errors.licenseDocument);
  assert(body.errors.idProof);
  assert.equal(removed.length, 1);
  assert(removed.every(filename => !fs.existsSync(filename)));
});

test('invalid experience, missing bio and short passwords return actionable errors', async () => {
  const response = await fetch(baseUrl, { method: 'POST', body: registration(documentFields, { yearsOfExperience: '-1', bio: ' ', password: 'short' }) });
  assert.equal(response.status, 400);
  const body = await response.json();
  assert(body.errors.yearsOfExperience);
  assert(body.errors.bio);
  assert(body.errors.password);
  assert.equal(saved, null);
  assert.equal(removed.length, 3);
});

test('complete multipart registration stores all three documents and hashes the password', async () => {
  const response = await fetch(baseUrl, { method: 'POST', body: registration() });
  assert.equal(response.status, 201);
  const body = await response.json();
  assert(body.doctorId);
  assert.equal(body.password, undefined);
  assert.equal(saved.phone, '+923001234567');
  assert.equal(saved.yearsOfExperience, 0);
  assert(await bcrypt.compare('test-password', saved.password));
  for (const field of documentFields) assert(fs.existsSync(path.join(__dirname, '../uploads/doctors', saved.documents[field])));
});

test('duplicate emails return a field error and remove unused documents', async () => {
  duplicate = true;
  const response = await fetch(baseUrl, { method: 'POST', body: registration() });
  assert.equal(response.status, 400);
  assert((await response.json()).errors.email);
  assert.equal(saved, null);
  assert.equal(removed.length, 3);
  assert(removed.every(filename => !fs.existsSync(filename)));
});

test('unexpected upload fields return a JSON error', async () => {
  const response = await fetch(baseUrl, { method: 'POST', body: registration(['wrongField']) });
  assert.equal(response.status, 400);
  assert.match((await response.json()).message, /upload/i);
});
