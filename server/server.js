// server.js
const express = require('express');

const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
dotenv.config({ path: require('path').join(__dirname, '.env') });
const connectDB = require('./config/conn');
const patientRoutes = require('./routes/patientRoutes');
const doctorAuthRoutes = require('./routes/doctorRoutes');
const bookingRoute = require('./routes/bookingRoutes');
const chatRoutes = require('./routes/chat');
const blogRoute = require('./routes/blogRoutes')
const policyRoutes = require('./routes/policy');
const chatbot = require('./routes/ChatBot');
const path = require('path');
const cors = require('cors');


connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/api/health', (req, res) => {
  const connected = require('mongoose').connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    database: connected ? 'connected' : 'unavailable',
    message: connected ? 'Service ready' : 'Database unavailable. Please try again shortly.',
  });
});
app.use(['/api/patients', '/api/doctor', '/api/appointment', '/api/chat', '/api/blog', '/api/policy', '/api/security-policy'], (req, res, next) => {
  if (require('mongoose').connection.readyState !== 1) {
    return res.status(503).json({ message: 'Database unavailable. Please try again shortly.' });
  }
  next();
});
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads/doctors", express.static(path.join(__dirname, "uploads/doctors")));
app.use("/uploads/blogs", express.static(path.join(__dirname, "uploads/blogs")));
app.use('/api/patients', patientRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/doctor', doctorAuthRoutes);
app.use('/api/appointment', bookingRoute);
app.use('/api/blog' , blogRoute)
app.use('/api/policy', policyRoutes);
app.use('/api/security-policy', require('./routes/securityPolicy'));
app.use('/api/ask', chatbot);




// Socket.IO logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinRoom', ({ userId }) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  socket.on('sendMessage', (data) => {
    const { receiverId } = data;
    io.to(receiverId).emit('receiveMessage', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
