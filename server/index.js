// index.js - Main server entry point with Socket.IO
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');           // Required for Socket.IO
const { Server } = require('socket.io'); // Socket.IO server
const connectDB = require('./db');
const { seedDefaultUsers } = require('./controllers/authController');
const { seedDemoData } = require('./controllers/seedController');

// Load .env variables
dotenv.config();

const app = express();

// Create HTTP server (instead of plain express) so Socket.IO can attach
const server = http.createServer(app);

// ===== SOCKET.IO SETUP =====
// This allows real-time bidirectional communication between server and clients
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Make io globally available so controllers can emit events
global.io = io;

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  // Client tells us which user they are (so we can send targeted notifications)
  socket.on('join', (userId) => {
    socket.join(userId); // Join a room named after userId
    console.log(`User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// ===== MIDDLEWARE =====
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000'
}));
app.use(express.json());

// ===== ROUTES =====
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({ message: '🚀 DevOps Platform API is running!' });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;

// Connect to DB, then seed data, then start server
connectDB().then(async () => {
  await seedDefaultUsers();
  // Small delay to ensure users are created before demo data seed
  setTimeout(() => seedDemoData(), 1000);
}).catch(console.error);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
