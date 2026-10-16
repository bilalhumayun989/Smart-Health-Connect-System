// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');

const protectPatient = async (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: 'Not authorized, no token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.patient = await Patient.findById(decoded.id).select("-password");
    if (!req.patient) return res.status(401).json({ message: 'Patient account not found. Please sign in again.' });
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = protectPatient;
