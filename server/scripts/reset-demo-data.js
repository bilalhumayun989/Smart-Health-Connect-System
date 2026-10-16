const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const express = require('express');
require('dotenv').config({ path: path.join(__dirname, '../.env'), quiet: true });
const Doctor = require('../models/Doctor');
const profiles = require('../data/pakistani-doctors.json');

const appCollections = ['doctors', 'patients', 'bookings', 'messages', 'blogs', 'privacypolicies', 'securitypolicies'];
const uploadRoot = path.resolve(__dirname, '../uploads');
const apply = process.argv.includes('--apply');
const expectedDatabase = process.argv.find(arg => arg.startsWith('--database='))?.slice('--database='.length);

function inside(root, file) {
  const resolved = path.resolve(file);
  assert(resolved.startsWith(root + path.sep), 'File must remain inside its intended directory');
  return resolved;
}

function uploadFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = inside(uploadRoot, path.join(directory, entry.name));
    assert(!entry.isSymbolicLink(), 'Upload links must be reviewed before reset');
    return entry.isDirectory() ? uploadFiles(file) : [file];
  });
}

function digest(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function demoDocument(name, type) {
  const escape = text => text.replace(/[\\()]/g, '\\$&');
  const lines = ['DEMO PLACEHOLDER - NOT A CREDENTIAL', name, type, 'Fictional Smart Health Connect demonstration account.', 'No real qualification, identity or hospital affiliation is asserted.'];
  const stream = 'BT /F1 16 Tf 48 740 Td ' + lines.map((line, index) => (index ? '0 -32 Td ' : '') + '(' + escape(line) + ') Tj').join('\n') + ' ET';
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', '<< /Length ' + Buffer.byteLength(stream) + ' >>\nstream\n' + stream + '\nendstream'];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => { offsets.push(Buffer.byteLength(pdf)); pdf += (index + 1) + ' 0 obj\n' + object + '\nendobj\n'; });
  const xref = Buffer.byteLength(pdf);
  pdf += 'xref\n0 6\n0000000000 65535 f \n' + offsets.slice(1).map(offset => String(offset).padStart(10, '0') + ' 00000 n \n').join('');
  return pdf + 'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF\n';
}

async function verifyPictures() {
  const results = await Promise.all(profiles.map(async profile => {
    const response = await fetch(profile.profileImage, { signal: AbortSignal.timeout(30000) });
    assert.equal(response.status, 200, 'Portrait unavailable: ' + profile.email);
    assert(response.headers.get('content-type')?.startsWith('image/'), 'Portrait URL must return an image');
    assert((await response.arrayBuffer()).byteLength > 1000, 'Portrait is unexpectedly small');
    return { email: profile.email, url: profile.profileImage, verified: true };
  }));
  console.log('All 15 external portrait URLs verified.');
  return results;
}

async function counts(db) {
  const result = {};
  for (const name of appCollections) result[name] = await db.collection(name).countDocuments();
  return result;
}

async function verifyLogins(credentials) {
  const app = express();
  app.use(express.json());
  app.use('/api/doctor', require('../routes/doctorRoutes'));
  const server = await new Promise(resolve => {
    const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
  });
  const base = 'http://127.0.0.1:' + server.address().port;
  try {
    for (const account of credentials) {
      const response = await fetch(base + '/api/doctor/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: account.email, password: account.password }) });
      assert.equal(response.status, 200, 'Login failed: ' + account.email);
      const login = await response.json();
      const profile = await fetch(base + '/api/doctor/me', { headers: { Authorization: 'Bearer ' + login.token } });
      assert.equal(profile.status, 200);
      const data = await profile.json();
      assert.equal(data.email, account.email);
      assert.equal(data.phone, '+92 317 7676560');
      assert.equal(data.password, undefined);
    }
  } finally { await new Promise(resolve => server.close(resolve)); }
  console.log('All 15 accounts passed the real login and profile routes.');
}

async function main() {
  assert.equal(profiles.length, 15);
  assert.equal(new Set(profiles.map(profile => profile.email)).size, 15);
  assert.equal(new Set(profiles.map(profile => profile.profileImage)).size, 15);
  const pictures = await verifyPictures();
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });
  const db = mongoose.connection.db;
  const existingCollections = (await db.listCollections().toArray()).map(item => item.name);
  assert(existingCollections.every(name => appCollections.includes(name)), 'Unexpected collections found; refusing to modify unrelated data');
  const beforeCounts = await counts(db);
  console.log(JSON.stringify({ mode: apply ? 'apply' : 'preview', database: db.databaseName, before: beforeCounts }));
  if (!apply) { console.log('Preview only. Apply requires --apply --database=' + db.databaseName); return; }
  assert.equal(expectedDatabase, db.databaseName, 'Explicit database name must match the configured database');

  const runId = new Date().toISOString().replace(/[:.]/g, '-');
  const backupRoot = path.resolve(__dirname, '../backups', runId);
  const privateRoot = path.resolve(__dirname, '../private', runId);
  fs.mkdirSync(backupRoot, { recursive: true });
  fs.mkdirSync(privateRoot, { recursive: true });
  const oldFiles = uploadFiles(uploadRoot);
  for (const file of oldFiles) {
    const destination = inside(backupRoot, path.join(backupRoot, 'uploads', path.relative(uploadRoot, file)));
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(file, destination, fs.constants.COPYFILE_EXCL);
    assert.equal(digest(file), digest(destination), 'Upload backup verification failed');
  }
  console.log('Archived and verified ' + oldFiles.length + ' previous upload files.');

  const credentials = [];
  const prepared = [];
  fs.mkdirSync(path.join(uploadRoot, 'doctors'), { recursive: true });
  for (const profile of profiles) {
    const { imageSource, imageCredit, ...fields } = profile;
    const password = 'Shc!' + crypto.randomBytes(12).toString('base64url');
    const documents = {};
    for (const type of ['degreeCertificate', 'licenseDocument', 'idProof']) {
      const filename = profile.licenseNumber.toLowerCase() + '-' + runId + '-' + type + '.pdf';
      fs.writeFileSync(inside(uploadRoot, path.join(uploadRoot, 'doctors', filename)), demoDocument('Dr. ' + profile.firstName + ' ' + profile.lastName, type), { flag: 'wx' });
      documents[type] = filename;
    }
    const doctor = new Doctor({ ...fields, password: await bcrypt.hash(password, 10), documents });
    await doctor.validate();
    prepared.push(doctor.toObject());
    credentials.push({ name: 'Dr. ' + profile.firstName + ' ' + profile.lastName, email: profile.email, password, specialty: profile.specialty, hospital: profile.hospitalAffiliation, phone: profile.phone });
  }
  fs.writeFileSync(path.join(privateRoot, 'doctor-logins.json'), JSON.stringify(credentials, null, 2), { flag: 'wx' });
  const session = await mongoose.startSession();
  const backupPath = path.join(backupRoot, 'database.ejson');
  try {
    await session.withTransaction(async () => {
      const collections = {};
      for (const name of existingCollections) collections[name] = await db.collection(name).find({}, { session }).toArray();
      const snapshot = { database: db.databaseName, createdAt: new Date(), collections };
      fs.writeFileSync(backupPath, mongoose.mongo.BSON.EJSON.stringify(snapshot, null, 2, { relaxed: false }));
      const check = mongoose.mongo.BSON.EJSON.parse(fs.readFileSync(backupPath, 'utf8'));
      for (const name of existingCollections) assert.equal(check.collections[name].length, collections[name].length);
      for (const name of existingCollections) await db.collection(name).deleteMany({}, { session });
      await Doctor.insertMany(prepared, { session });
    });
  } finally { await session.endSession(); }

  const afterCounts = await counts(db);
  assert.equal(afterCounts.doctors, 15);
  assert(appCollections.filter(name => name !== 'doctors').every(name => afterCounts[name] === 0));
  await verifyLogins(credentials);
  for (const doctor of await Doctor.find()) {
    assert(doctor.profileImage.startsWith('https://images.pexels.com/'));
    for (const filename of Object.values(doctor.toObject().documents)) assert(fs.existsSync(inside(uploadRoot, path.join(uploadRoot, 'doctors', filename))));
  }
  for (const file of oldFiles) {
    const archived = inside(backupRoot, path.join(backupRoot, 'uploads', path.relative(uploadRoot, file)));
    assert.equal(digest(file), digest(archived), 'An old upload changed after backup; it will not be removed');
    fs.unlinkSync(inside(uploadRoot, file));
  }
  const markdown = [
    '# Doctor account logins', '',
    '15 fictional Pakistani demonstration accounts. These are usable application logins, not real physician identities. Stock portraits are illustrative; hospital affiliations are sample data.', '',
    'Phone for every account: **+92 317 7676560**. The .example email domain is for demo login IDs and does not receive mail.', '',
    '| Doctor | Specialty | Login email | Password |', '| --- | --- | --- | --- |',
    ...credentials.map(account => '| ' + account.name + ' | ' + account.specialty + ' | ' + account.email + ' | ' + account.password + ' |'), '',
    '## Hospital references', '',
    '- [Aga Khan University Hospital, Karachi](https://hospitals.aku.edu/pakistan/karachi/pages/default.aspx)',
    '- [Shifa International Hospital, Islamabad](https://shifa.com.pk/contact-us)',
    '- [Shalamar Hospital, Lahore](https://shalamarhospital.org.pk/)', '',
    '## Photo sources', '',
    ...profiles.map(profile => '- ' + profile.firstName + ' ' + profile.lastName + ': [' + profile.imageCredit + ' / Pexels](' + profile.imageSource + ')'), '',
    'Previous database and uploads backed up at: ' + backupRoot, '',
    'All accounts passed the existing doctor login and profile endpoints after insertion. Stored fields use the same Doctor model, bcrypt password hashing, and three document fields as normal registration. Supporting documents are explicitly marked demo placeholders.', '',
  ].join('\n');
  fs.writeFileSync(path.join(privateRoot, 'doctor-logins.md'), markdown);
  fs.writeFileSync(path.join(privateRoot, 'doctor-logins.csv'), 'Doctor,Email,Password,Phone\n' + credentials.map(account => [account.name, account.email, account.password, account.phone].map(value => JSON.stringify(value)).join(',')).join('\n') + '\n');
  const result = { completedAt: new Date().toISOString(), database: db.databaseName, before: beforeCounts, after: afterCounts, backup: backupRoot, credentials: privateRoot, externalPictures: pictures, loginVerification: { passed: 15, total: 15 }, oldUploadsArchived: oldFiles.length };
  fs.writeFileSync(path.join(privateRoot, 'verification.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify({ after: afterCounts, backup: backupRoot, credentials: privateRoot, loginChecks: '15/15 passed', oldUploadsArchived: oldFiles.length }));
}

main().catch(error => {
  console.error('Reset stopped:', error.name, error.message?.replace(/mongodb(?:\+srv)?:\/\/[^\s]+/g, '[database URI redacted]'));
  process.exitCode = 1;
}).finally(() => mongoose.disconnect());
