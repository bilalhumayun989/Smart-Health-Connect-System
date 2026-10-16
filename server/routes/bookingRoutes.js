const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const protectPatient = require('../middleware/authMiddleware');

router.get('/patient/me', protectPatient, async (req, res) => {
  try {
    const appointments = await Booking.find({ patientId: req.patient._id })
      .sort({ appointmentDate: -1, appointmentTime: -1 });
    res.json(appointments);
  } catch {
    res.status(500).json({ message: 'Unable to load your appointments. Please try again.' });
  }
});

// POST /api/bookings
// Create a new booking
router.post('/book', async (req, res) => {
  try {
    const {
      doctorId,
      doctorName,
      appointmentDate,
      appointmentTime,
      paymentMethod,
      patientId,
      patientName,
      patientEmail,
      patientImage,
    } = req.body;

    const newBooking = new Booking({
      doctorId,
      doctorName,
      appointmentDate,
      appointmentTime,
      paymentMethod,
      patientId,
      patientName,
      patientEmail,
      patientImage,
    });

    await newBooking.save();

    res.status(201).json({
      message: 'Booking created successfully',
      booking: newBooking,
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/all', async (req, res) => {
  try {
    const appointments = await Booking.find();
    res.json(appointments);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/bookings/:id
// Get booking by ID
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const bookings = await Booking.find({ doctorId: req.params.doctorId });
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/hasAppointment/:patientId/:doctorId', async (req, res) => {
  const { patientId, doctorId } = req.params;
  const appointment = await Booking.findOne({ patientId, doctorId });
  if (appointment) {
    res.json({ hasAppointment: true });
  } else {
    res.json({ hasAppointment: false });
  }
});

module.exports = router;
