// backend/routes/doctorRoutes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const generateDoctorToken = require('../utils/generateDoctorToken');
const Doctor = require("../models/Doctor");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const UPLOADS_DIR = path.resolve(__dirname, "../uploads/doctors");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ storage });

const documentLabels = {
  degreeCertificate: 'Degree certificate',
  licenseDocument: 'License document',
  idProof: 'ID proof',
};

const registrationUpload = upload.fields([
  { name: 'profileImage', maxCount: 1 },
  ...Object.keys(documentLabels).map(name => ({ name, maxCount: 1 })),
]);

async function discardRegistrationUploads(req) {
  await Promise.all(Object.values(req.files || {}).flat().map(file =>
    fs.promises.unlink(file.path).catch(error => {
      if (error.code !== 'ENOENT') console.warn('Could not remove an unused registration upload.');
    })
  ));
}

function validationErrors(error) {
  return Object.fromEntries(Object.entries(error.errors).map(([path, detail]) => {
    const field = path.replace('documents.', '');
    return [field, documentLabels[field] ? 'Upload your ' + documentLabels[field].toLowerCase() + '.' : detail.kind === 'required' ? 'This field is required.' : 'Enter a valid value.'];
  }));
}

router.post('/register', (req, res, next) => {
  registrationUpload(req, res, error => {
    if (error) return res.status(400).json({ message: 'Unable to upload your files. Check the upload fields and try again.' });
    next();
  });
}, async (req, res) => {
  try {
    const body = req.body || {};
    const fields = ['email', 'firstName', 'lastName', 'specialty', 'licenseNumber', 'hospitalAffiliation', 'bio'];
    const data = Object.fromEntries(fields.map(field => [field, typeof body[field] === 'string' ? body[field].trim() : '']));
    const phone = Array.isArray(body.phone) ? body.phone[body.phone.length - 1] : body.phone;
    data.phone = typeof phone === 'string' ? phone.trim() : '';
    data.password = typeof body.password === 'string' ? body.password : '';
    data.yearsOfExperience = body.yearsOfExperience;
    data.profileImage = req.files?.profileImage?.[0]?.filename || '';
    data.documents = Object.fromEntries(Object.keys(documentLabels).map(field => [field, req.files?.[field]?.[0]?.filename || '']));

    const newDoctor = new Doctor(data);
    const schemaError = newDoctor.validateSync();
    const errors = schemaError ? validationErrors(schemaError) : {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Enter a valid email address.';
    if (data.password.length < 8) errors.password = 'Use at least 8 characters.';
    const years = Number(data.yearsOfExperience);
    if (data.yearsOfExperience == null || String(data.yearsOfExperience).trim() === '' || !Number.isInteger(years) || years < 0) errors.yearsOfExperience = 'Enter a whole number of years (0 or more).';
    if (req.files?.profileImage?.[0]?.size > 2 * 1024 * 1024) errors.profileImage = 'Choose a profile photo smaller than 2 MB.';
    if (Object.keys(errors).length) {
      await discardRegistrationUploads(req);
      return res.status(400).json({ message: 'Please check the highlighted fields and upload all three verification documents.', errors });
    }

    const existing = await Doctor.findOne({ email: data.email });
    if (existing) {
      await discardRegistrationUploads(req);
      return res.status(400).json({ message: 'Email already registered', errors: { email: 'This email is already registered. Please sign in.' } });
    }

    newDoctor.password = await bcrypt.hash(data.password, 10);
    await newDoctor.save();
    const token = generateDoctorToken(newDoctor._id);
    res.status(201).json({ message: 'Doctor registered successfully', token, doctorId: newDoctor._id });
  } catch (error) {
    await discardRegistrationUploads(req);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Please check the highlighted fields.', errors: validationErrors(error) });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already registered', errors: { email: 'This email is already registered. Please sign in.' } });
    }
    console.error('Doctor registration failed:', error.name);
    res.status(500).json({ message: 'Unable to create your account. Please try again.' });
  }
});
router.post('/login', async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim() : '';
  const { password } = req.body;
  try {
    const doctor = await Doctor.findOne({ email });
    if (!doctor) return res.status(400).json({ message: 'Doctor not found' });

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateDoctorToken(doctor._id);

    res.json({ 
      message: 'Login successful',
      token,
      doctorId: doctor._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Please sign in as a doctor.' });
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.DOCTOR_SECRET);
    if (typeof decoded.id !== 'string' || !/^[a-f\d]{24}$/i.test(decoded.id)) {
      return res.status(401).json({ code: 'DOCTOR_SESSION_INVALID', message: 'Your doctor session is invalid. Please sign in again.' });
    }
  } catch {
    return res.status(401).json({ message: 'Your session has expired. Please sign in again.' });
  }
  try {
    const doctor = await Doctor.findById(decoded.id).select('-password -documents');
    if (!doctor) return res.status(401).json({ code: 'DOCTOR_SESSION_INVALID', message: 'This doctor account is no longer available. Please sign in again.' });
    res.json(doctor);
  } catch {
    res.status(500).json({ message: 'Unable to load your profile.' });
  }
});
router.get("/all-doctor", async (req, res) => {
  try {
    const doctors = await Doctor.find().select('-password -documents').sort({ createdAt: -1 });
    res.json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch doctors" });
  }
});
module.exports = router;
