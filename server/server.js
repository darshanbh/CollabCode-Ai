const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const aiRoutes = require('./routes/aiRoutes');
const codeRoutes = require('./routes/codeRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const socketHandler = require('./socket/socketHandler');

const plagiarismRoutes = require('./routes/plagiarismRoutes');
const submissionRoutes = require('./routes/submissionRoutes');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.send('🚀 AI Collaborative Coding Platform API is running...');
});

// Routes
app.use('/api/plagiarism', plagiarismRoutes);
app.use('/api/submissions', submissionRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/sessions', sessionRoutes); // ✅ session recording

// Socket.IO
socketHandler(io);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    server.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));