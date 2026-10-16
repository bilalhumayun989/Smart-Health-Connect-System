Smart Health Connect System

A full-stack, real-time healthcare management platform that enables secure communication between "patients" and "doctors" with a fully integrated "admin dashboard" to monitor system users and activities.

Overview

Smart Health Connect System allows:
 Patients to register, login, book appointments, and chat with doctors post-appointment.
 Doctors to register, login, view incoming appointments, and chat with patients.
 Admin to monitor registered users through a dashboard with visual analytics.

This platform ensures security, efficiency, and real-time interaction between healthcare providers and patients.

 Modules

This project consists of three core modules:

1. Patient-Doctor Frontend 
2. Admin Dashboard 
3. Server Backend

Features (Completed)

Patient-Doctor Module
  Patient Registration and Login
  Doctor Registration and Login
  Patient must be logged in to:
  Book an appointment with a doctor
  Initiate chat (after appointment)
 Doctors can:
 View patient appointment 
 Chat with patients post-appointment
 Real-time messaging using Socket.IO
 User-friendly UI with animated components

Admin Dashboard
View total number of registered doctors
View total number of registered patients
Charts and insights powered by Chart.js and Recharts

Backend Server
RESTful API using Express.js
MongoDB for persistent data storage
JWT authentication for secure login
Real-time communication via Socket.IO
Middleware support for body parsing, CORS, and file upload (Multer)


User Flow
 Patient Flow
1. Lands on homepage
2. Tries to book appointment → Redirected to login/register
3. Registers or logs in
4. Can now:
    View doctors
    Book appointment
    Chat with doctor after appointment

Doctor Flow
1. Registers with required details
2. Logs in
3. Views incoming appointment requests
4. Chats with assigned patients (post-appointment)

 Admin Flow
Opens admin panel
Views:
  Count of registered patients
  Count of registered doctors
  Charts and metrics

Tech Stack

Frontend (Patient-Doctor & Admin)
React 19
TailwindCSS
Axios, Framer Motion, React Router DOM
Socket.IO Client
Chart.js, Recharts (Admin Dashboard)
Vite for lightning-fast development

 Backend
Node.js, Express.js
MongoDB with "Mongoose"
JWT for authentication
Socket.IO for real-time messaging
Multer, dotenv, bcrypt, CORS


## Local development

Start the API with `cd server` and `npm start`. Start each frontend in its own terminal with `npm run dev` from `patient-doctor` and `admin`.

Both frontends require `VITE_API_URL`. Copy the frontend's `.env.example` to `.env`, set the API's reachable URL, and restart Vite after changing it. The example files use localhost for local development; production builds must set `VITE_API_URL` to the deployed API URL.

The API reads `server/.env` regardless of the terminal's working directory. `GET /api/health` reports whether MongoDB is connected. Database failures return HTTP 503 and appear as retryable errors in the directory and dashboard.

Doctor and patient lists show saved records; dashboard activity uses registration timestamps and scheduled appointment dates. Missing uploaded photos display a generic avatar. Restore the original files under `server/uploads/doctors` to show missing doctor photos; do not seed or replace database records to repair images.

Run `npm test` in `admin` for analytics date and empty-data checks. Run `npm run lint` and `npm run build` in each frontend to validate it. In Windows PowerShell with restricted script execution, use `npm.cmd` in place of `npm`.

## Repository and environment setup

Project repository: https://github.com/bilalhumayun989/Smart-Health-Connect-System

Copy `server/.env.example` to `server/.env` and configure MongoDB and unique random JWT_SECRET and DOCTOR_SECRET values. Set OPENAI_API_KEY only if the chatbot is required. Doctor token signing uses DOCTOR_SECRET; sign in again after changing it.

The patient frontend runs on port 5174 and the admin frontend on port 5173 by default. Set VITE_API_URL in each frontend to the reachable backend URL before building for hosting. The patient navbar's Admin link uses VITE_ADMIN_URL, defaulting to https://healthcare.broshtech.com/. Serve each frontend with an SPA fallback to index.html, and host the Express backend on a service that supports WebSockets and persistent uploaded files. GitHub stores this source repository; a live full-stack deployment requires a hosting target and environment variables.

Database backups, doctor login sheets, uploaded documents, local environment files, dependencies, test browser artifacts, and build output are excluded from Git. Seeding is optional and never runs during installation or startup. The default seed command only previews; its --apply flag resets application data and must be used intentionally.
