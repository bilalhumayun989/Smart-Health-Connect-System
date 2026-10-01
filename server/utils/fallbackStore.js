const mongoose = require('mongoose');

const fallbackData = {
  patients: [],
  doctors: [],
  bookings: [],
  blogs: [],
};

const seeded = { patients: false, doctors: false, bookings: false, blogs: false };

function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

function cloneItem(item) {
  return item ? JSON.parse(JSON.stringify(item)) : null;
}

function getCollection(name) {
  if (!fallbackData[name]) {
    fallbackData[name] = [];
  }
  return fallbackData[name];
}

function ensureSeed() {
  if (!seeded.patients && getCollection('patients').length === 0) {
    getCollection('patients').push({
      _id: 'patient-demo-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'patient@example.com',
      password: '$2a$10$M0FM5QX7uWm4Yd0HZWfVhO4Wpza5Qj9z6jL7v8I5wHnN6cNfIxM6e',
      phone: '1234567890',
      countryCode: '+1',
      profileImage: '',
    });
    seeded.patients = true;
  }

  if (!seeded.doctors && getCollection('doctors').length === 0) {
    getCollection('doctors').push({
      _id: 'doctor-demo-1',
      firstName: 'Dr. Alice',
      lastName: 'Ng',
      email: 'doctor@example.com',
      password: '$2a$10$M0FM5QX7uWm4Yd0HZWfVhO4Wpza5Qj9z6jL7v8I5wHnN6cNfIxM6e',
      specialty: 'General Medicine',
      phone: '0987654321',
      yearsOfExperience: 8,
      hospitalAffiliation: 'City Hospital',
      bio: 'Sample doctor profile',
      profileImage: '',
      documents: {
        degreeCertificate: '',
        licenseDocument: '',
        idProof: '',
      },
    });
    seeded.doctors = true;
  }

  if (!seeded.bookings && getCollection('bookings').length === 0) {
    getCollection('bookings').push({
      _id: 'booking-demo-1',
      doctorId: 'doctor-demo-1',
      doctorName: 'Dr. Alice Ng',
      appointmentDate: '2026-08-01',
      appointmentTime: '10:00',
      paymentMethod: 'Card',
      patientId: 'patient-demo-1',
      patientName: 'John Doe',
      patientEmail: 'patient@example.com',
      patientImage: '',
    });
    seeded.bookings = true;
  }

  if (!seeded.blogs && getCollection('blogs').length === 0) {
    getCollection('blogs').push({
      _id: 'blog-demo-1',
      title: 'Healthy Habits',
      subheading: 'Daily routines for wellness',
      description: 'A simple overview of wellness habits that support long-term health.',
      blogImage: '',
      descriptionImage: '',
    });
    seeded.blogs = true;
  }
}

function findAllFallback(collectionName) {
  ensureSeed();
  return getCollection(collectionName).map(cloneItem);
}

function findOneFallback(collectionName, query) {
  ensureSeed();
  const collection = getCollection(collectionName);
  return cloneItem(collection.find((item) => Object.entries(query).every(([key, value]) => item[key] === value)) || null);
}

function findByIdFallback(collectionName, id) {
  ensureSeed();
  const collection = getCollection(collectionName);
  return cloneItem(collection.find((item) => item._id === id) || null);
}

function createFallbackRecord(collectionName, data) {
  ensureSeed();
  const collection = getCollection(collectionName);
  const id = data._id || `${collectionName.slice(0, -1)}-${Date.now()}`;
  const record = { ...data, _id: id };
  collection.push(record);
  return cloneItem(record);
}

module.exports = {
  isMongoConnected,
  findAllFallback,
  findOneFallback,
  findByIdFallback,
  createFallbackRecord,
};
