// seed.js — run with: node seed.js
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // bypass local DNS SRV block

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const Doctor  = require('./models/Doctor');
const Patient = require('./models/Patient');
const Booking = require('./models/Booking');
const Blog    = require('./models/Blog');

const MONGO_URI = process.env.MONGO_URI;

/* ── Dummy Doctors ── */
const doctors = [
  {
    firstName: 'James', lastName: 'Carter',
    email: 'james.carter@smarthealth.com', phone: '9876543210',
    password: 'password123',
    specialty: 'Cardiology', licenseNumber: 'LIC-CARD-001',
    yearsOfExperience: 12, hospitalAffiliation: 'City Heart Hospital',
    bio: 'Experienced cardiologist specializing in interventional procedures.',
    profileImage: 'profileImage-1748346088135-213292342.jpg',
    documents: {
      degreeCertificate: 'degreeCertificate-1748343902847-277868979.jpg',
      licenseDocument:   'licenseDocument-1748343902866-461532581.jpg',
      idProof:           'idProof-1748343902871-963757727.jpg',
    },
  },
  {
    firstName: 'Sarah', lastName: 'Mitchell',
    email: 'sarah.mitchell@smarthealth.com', phone: '9876543211',
    password: 'password123',
    specialty: 'Neurology', licenseNumber: 'LIC-NEUR-002',
    yearsOfExperience: 9, hospitalAffiliation: 'Neuro Care Centre',
    bio: 'Specialist in neurological disorders and brain health management.',
    profileImage: 'profileImage-1748498791918-239879889.jpg',
    documents: {
      degreeCertificate: 'degreeCertificate-1748344065990-675490057.jpg',
      licenseDocument:   'licenseDocument-1748344065998-704952610.jpg',
      idProof:           'idProof-1748344066000-344669491.jpg',
    },
  },
  {
    firstName: 'David', lastName: 'Lee',
    email: 'david.lee@smarthealth.com', phone: '9876543212',
    password: 'password123',
    specialty: 'Orthopedics', licenseNumber: 'LIC-ORTH-003',
    yearsOfExperience: 15, hospitalAffiliation: 'Bone & Joint Clinic',
    bio: 'Expert in joint replacement and sports injury rehabilitation.',
    profileImage: 'profileImage-1750245020187-763474856.png',
    documents: {
      degreeCertificate: 'degreeCertificate-1748344110522-181952469.jpg',
      licenseDocument:   'licenseDocument-1748344110533-899986121.jpg',
      idProof:           'idProof-1748344110535-941762594.jpg',
    },
  },
  {
    firstName: 'Priya', lastName: 'Sharma',
    email: 'priya.sharma@smarthealth.com', phone: '9876543213',
    password: 'password123',
    specialty: 'Dermatology', licenseNumber: 'LIC-DERM-004',
    yearsOfExperience: 7, hospitalAffiliation: 'Skin & Wellness Clinic',
    bio: 'Dedicated dermatologist focused on skin health and aesthetic care.',
    profileImage: 'profileImage-1750245109872-425955594.png',
    documents: {
      degreeCertificate: 'degreeCertificate-1748346088092-428917210.jpg',
      licenseDocument:   'licenseDocument-1748346088116-612959760.jpg',
      idProof:           'idProof-1748346088129-448463740.jpg',
    },
  },
  {
    firstName: 'Omar', lastName: 'Hassan',
    email: 'omar.hassan@smarthealth.com', phone: '9876543214',
    password: 'password123',
    specialty: 'General Medicine', licenseNumber: 'LIC-GEN-005',
    yearsOfExperience: 5, hospitalAffiliation: 'Metro General Hospital',
    bio: 'General practitioner with expertise in preventive medicine.',
    profileImage: 'profileImage-1752636383943-575562117.jpg',
    documents: {
      degreeCertificate: 'degreeCertificate-1748498791781-585600559.jpg',
      licenseDocument:   'licenseDocument-1748498791835-559203439.jpg',
      idProof:           'idProof-1748498791884-911463732.png',
    },
  },
  {
    firstName: 'Emily', lastName: 'Watson',
    email: 'emily.watson@smarthealth.com', phone: '9876543215',
    password: 'password123',
    specialty: 'Pediatrics', licenseNumber: 'LIC-PED-006',
    yearsOfExperience: 10, hospitalAffiliation: 'Children\'s Health Hub',
    bio: 'Pediatrician committed to child development and family health.',
    profileImage: 'profileImage-1753521724361-51075529.jpg',
    documents: {
      degreeCertificate: 'degreeCertificate-1750245020140-171569791.png',
      licenseDocument:   'licenseDocument-1750245020170-245632717.png',
      idProof:           'idProof-1750245020178-706505255.png',
    },
  },
];

/* ── Dummy Patients ── */
const patients = [
  { firstName: 'Alice', lastName: 'Johnson', email: 'alice.j@email.com', phone: '9001000001', countryCode: '+1', password: 'patient123', profileImage: '1748334866910-shirt3.webp' },
  { firstName: 'Bob', lastName: 'Williams', email: 'bob.w@email.com', phone: '9001000002', countryCode: '+1', password: 'patient123', profileImage: '1748335420709-shirt2.jpg' },
  { firstName: 'Clara', lastName: 'Perez', email: 'clara.p@email.com', phone: '9001000003', countryCode: '+44', password: 'patient123', profileImage: '1748421128612-shirt3.webp' },
  { firstName: 'Daniel', lastName: 'Kim', email: 'daniel.k@email.com', phone: '9001000004', countryCode: '+82', password: 'patient123', profileImage: '1748421181912-shirt3.webp' },
  { firstName: 'Eva', lastName: 'Müller', email: 'eva.m@email.com', phone: '9001000005', countryCode: '+49', password: 'patient123', profileImage: '1748494802811-Imran Pic.jpg' },
  { firstName: 'Frank', lastName: 'Nguyen', email: 'frank.n@email.com', phone: '9001000006', countryCode: '+84', password: 'patient123', profileImage: '1748498867312-shirt3.webp' },
  { firstName: 'Grace', lastName: 'Okafor', email: 'grace.o@email.com', phone: '9001000007', countryCode: '+234', password: 'patient123', profileImage: '1752635752779-Gray 1.jpg' },
  { firstName: 'Henry', lastName: 'Patel', email: 'henry.p@email.com', phone: '9001000008', countryCode: '+91', password: 'patient123', profileImage: '1753521479537-Black 2.jpg' },
];

/* ── Dummy Blogs ── */
const blogs = [
  {
    title: 'Heart Health: 10 Tips to Keep Your Heart Strong',
    subheading: 'Simple daily habits that protect your cardiovascular system',
    description: 'Cardiovascular disease is one of the leading causes of death worldwide. However, most heart diseases can be prevented with the right lifestyle choices. Regular exercise, a balanced diet low in saturated fats, quitting smoking, and managing stress are all key factors. Studies show that even 30 minutes of moderate physical activity five days a week can reduce heart disease risk by up to 35%. Monitoring blood pressure and cholesterol regularly is also essential. Consult your cardiologist annually for preventive screenings and make heart health a daily priority.',
    blogImage: 'blogImage-1748516392941-635600322.jfif',
    descriptionImage: 'descriptionImage-1748516392948-426846980.webp',
  },
  {
    title: 'Understanding Mental Health in the Modern World',
    subheading: 'Breaking the stigma around anxiety, depression and burnout',
    description: 'Mental health issues affect 1 in 4 people globally at some point in their lives. Despite this, stigma and lack of awareness remain major barriers to treatment. Anxiety and depression are the most common mental health disorders, yet many go undiagnosed for years. Early intervention significantly improves outcomes. Mindfulness, therapy, medication when appropriate, and building strong social connections all contribute to mental wellness. It is vital for workplaces and healthcare systems to prioritise mental health support alongside physical health.',
    blogImage: 'blogImage-1748517788431-42675777.png',
    descriptionImage: 'descriptionImage-1748517788444-345978583.png',
  },
  {
    title: 'Nutrition Guide: Eating for Longevity',
    subheading: 'Evidence-based dietary choices that extend healthy life expectancy',
    description: 'The food we eat directly influences how we age and our risk for chronic diseases. A diet rich in vegetables, fruits, whole grains, legumes and healthy fats has been consistently linked to longer, healthier lives. The Mediterranean diet, for example, is associated with reduced rates of heart disease, dementia and cancer. Reducing processed foods, added sugars and excessive red meat is equally important. Hydration is often overlooked — drinking adequate water supports every organ system. Small, consistent dietary improvements compound over time into major health benefits.',
    blogImage: 'blogImage-1748517890181-44567388.png',
    descriptionImage: 'descriptionImage-1748517890268-438587205.png',
  },
  {
    title: 'Diabetes Management: Living Well with Type 2',
    subheading: 'Practical strategies for blood sugar control and quality of life',
    description: 'Type 2 diabetes affects over 400 million people worldwide. While it is a serious condition, it is highly manageable with the right approach. Regular blood glucose monitoring, a low-glycaemic diet, consistent physical activity and medication adherence are the pillars of management. Foot care and regular eye and kidney screenings are critical to preventing complications. Many patients achieve remission through sustained lifestyle changes. Working closely with your healthcare team, including a dietitian and diabetes educator, ensures the best possible outcomes.',
    blogImage: 'blogImage-1748518022349-25303065.jpg',
    descriptionImage: 'descriptionImage-1748518022381-127311866.jpg',
  },
];

/* ── Dates helper ── */
const dateStr = (daysAgo) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

const times = ['09:00 AM', '10:30 AM', '11:00 AM', '02:00 PM', '03:30 PM', '04:00 PM'];
const methods = ['Cash', 'Credit Card', 'Online', 'Insurance'];

/* ── Main seed function ── */
async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // ── Doctors ──
    let insertedDoctors = [];
    for (const d of doctors) {
      const exists = await Doctor.findOne({ email: d.email });
      if (exists) {
        console.log(`  ⚡ Doctor already exists: ${d.email}`);
        insertedDoctors.push(exists);
        continue;
      }
      const hash = await bcrypt.hash(d.password, 10);
      const doc = await Doctor.create({ ...d, password: hash });
      insertedDoctors.push(doc);
      console.log(`  ✅ Doctor inserted: Dr. ${d.firstName} ${d.lastName}`);
    }

    // ── Patients ──
    let insertedPatients = [];
    for (const p of patients) {
      const exists = await Patient.findOne({ email: p.email });
      if (exists) {
        console.log(`  ⚡ Patient already exists: ${p.email}`);
        insertedPatients.push(exists);
        continue;
      }
      const hash = await bcrypt.hash(p.password, 10);
      const pat = await Patient.create({ ...p, password: hash });
      insertedPatients.push(pat);
      console.log(`  ✅ Patient inserted: ${p.firstName} ${p.lastName}`);
    }

    // ── Blogs ──
    for (const b of blogs) {
      const exists = await Blog.findOne({ title: b.title });
      if (exists) {
        console.log(`  ⚡ Blog already exists: ${b.title.substring(0, 40)}…`);
        continue;
      }
      await Blog.create(b);
      console.log(`  ✅ Blog inserted: ${b.title.substring(0, 40)}…`);
    }

    // ── Appointments ──
    const existingCount = await Booking.countDocuments();
    if (existingCount >= 12) {
      console.log(`  ⚡ Appointments already seeded (${existingCount} found). Skipping.`);
    } else {
      const appointmentData = [
        { doctorIdx: 0, patientIdx: 0, daysAgo: 0,  timeIdx: 0, methodIdx: 0 },
        { doctorIdx: 1, patientIdx: 1, daysAgo: 0,  timeIdx: 1, methodIdx: 1 },
        { doctorIdx: 2, patientIdx: 2, daysAgo: 1,  timeIdx: 2, methodIdx: 2 },
        { doctorIdx: 3, patientIdx: 3, daysAgo: 1,  timeIdx: 3, methodIdx: 3 },
        { doctorIdx: 4, patientIdx: 4, daysAgo: 2,  timeIdx: 4, methodIdx: 0 },
        { doctorIdx: 5, patientIdx: 5, daysAgo: 2,  timeIdx: 5, methodIdx: 1 },
        { doctorIdx: 0, patientIdx: 6, daysAgo: 3,  timeIdx: 0, methodIdx: 2 },
        { doctorIdx: 1, patientIdx: 7, daysAgo: 3,  timeIdx: 1, methodIdx: 3 },
        { doctorIdx: 2, patientIdx: 0, daysAgo: 5,  timeIdx: 2, methodIdx: 0 },
        { doctorIdx: 3, patientIdx: 1, daysAgo: 6,  timeIdx: 3, methodIdx: 1 },
        { doctorIdx: 4, patientIdx: 2, daysAgo: 7,  timeIdx: 4, methodIdx: 2 },
        { doctorIdx: 5, patientIdx: 3, daysAgo: 8,  timeIdx: 5, methodIdx: 3 },
        { doctorIdx: 0, patientIdx: 4, daysAgo: 10, timeIdx: 0, methodIdx: 0 },
        { doctorIdx: 1, patientIdx: 5, daysAgo: 12, timeIdx: 1, methodIdx: 1 },
        { doctorIdx: 2, patientIdx: 6, daysAgo: 14, timeIdx: 2, methodIdx: 2 },
      ];

      for (const a of appointmentData) {
        const doc = insertedDoctors[a.doctorIdx];
        const pat = insertedPatients[a.patientIdx];
        if (!doc || !pat) continue;
        await Booking.create({
          doctorId:         doc._id,
          doctorName:       `Dr. ${doc.firstName} ${doc.lastName}`,
          patientId:        pat._id,
          patientName:      `${pat.firstName} ${pat.lastName}`,
          patientEmail:     pat.email,
          patientImage:     pat.profileImage || '',
          appointmentDate:  dateStr(a.daysAgo),
          appointmentTime:  times[a.timeIdx],
          paymentMethod:    methods[a.methodIdx],
        });
        console.log(`  ✅ Appointment: Dr. ${doc.lastName} ↔ ${pat.firstName} on ${dateStr(a.daysAgo)}`);
      }
    }

    console.log('\n🎉 Seeding complete! Your dashboard now has dummy data.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

seed();
