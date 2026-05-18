const Message = require('../models/Message');
const Room = require('../models/Room');
const Session = require('../models/Session');

const roomState = {};
const saveTimeouts = {};

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    // =========================
    // JOIN ROOM
    // =========================
    socket.on('join-room', ({ roomId, userName, userId }) => {
      socket.join(roomId);
      socket.data.roomId = roomId;
      socket.data.userName = userName;
      socket.data.userId = userId;

      console.log(`👤 ${userName} joined room ${roomId}`);
      socket.to(roomId).emit('user-joined', { userName });

      const updateUsers = async () => {
        const room = await Room.findOne({ roomId });
        const ownerId = room ? String(room.createdBy) : null;

        const clients = io.sockets.adapter.rooms.get(roomId);
        const users = [];
        if (clients) {
          clients.forEach(clientId => {
            const s = io.sockets.sockets.get(clientId);
            if (s && s.data.userName) {
              users.push({
                name: s.data.userName,
                isHost: ownerId && String(s.data.userId) === ownerId
              });
            }
          });
        }
        io.to(roomId).emit('active-users', users);
      };

      updateUsers();
    });

    // =========================
    // CODE CHANGE
    // =========================
    socket.on("code-change", async ({ roomId, code }) => {
      try {
        const room = await Room.findOne({ roomId });

        if (room?.isLocked) {
          socket.emit('edit-blocked', { reason: 'Room is locked by the owner' });
          return;
        }

        const isExamMode = room?.mode === 'exam' && !room?.examEnded;

        if (isExamMode) {
          const participant = room?.participants.find(
            p => String(p.userId) === String(socket.data.userId)
          );
          if (participant && participant.role === 'viewer') {
            socket.emit('edit-blocked', { reason: 'Viewers cannot edit code' });
            return;
          }
          // ✅ Exam mode — store per user, NO broadcast to others
          if (!roomState[roomId]) roomState[roomId] = {};
          roomState[roomId][socket.data.userId] = code;
        } else {
          // ✅ Normal collab mode — broadcast to everyone
          roomState[roomId] = code;
          socket.to(roomId).emit("code-update", code);
        }

      } catch (err) {
        console.error('RBAC check failed:', err.message);
      }

      // Snapshot for session replay
      Session.findOneAndUpdate(
        { roomId },
        { $push: { snapshots: { code, timestamp: new Date(), userId: socket.data.userId } } },
        { upsert: true, new: true }
      ).catch(err => console.error('Session record error:', err));

      // Debounced save
      if (saveTimeouts[roomId]) clearTimeout(saveTimeouts[roomId]);
      saveTimeouts[roomId] = setTimeout(async () => {
        try {
          await Room.findOneAndUpdate({ roomId }, { codeContent: code }, { new: true });
          console.log(`💾 Auto-saved room ${roomId}`);
          io.to(roomId).emit('save-status', { status: 'saved' });
        } catch (err) {
          console.error(`❌ Save failed for room ${roomId}:`, err.message);
          io.to(roomId).emit('save-status', { status: 'failed' });
        }
      }, 2000);
    });// =========================
    // LANGUAGE CHANGE
    // =========================
    socket.on('language-change', ({ roomId, language }) => {
      socket.to(roomId).emit('language-update', language);
    });

    // =========================
    // QUESTION CHANGE
    // =========================
    socket.on('question-change', ({ roomId, question }) => {
      socket.to(roomId).emit('question-update', question);
    });

    // =========================
    // CHAT MESSAGE
    // =========================
    socket.on('send-message', async ({ roomId, userId, userName, message }) => {
      try {
        await Message.create({ roomId, userId, userName, message });
      } catch (err) {
        console.error('Message save error:', err.message);
      }
      io.to(roomId).emit('receive-message', {
        userName,
        message,
        time: new Date().toLocaleTimeString()
      });
    });

    // =========================
    // EXAM MODE — start
    // =========================
    socket.on('exam-started', ({ roomId, duration }) => {
      socket.to(roomId).emit('exam-started', { duration });
    });

    // =========================
    // EXAM MODE — end
    // =========================
    socket.on('exam-ended', ({ roomId }) => {
      socket.to(roomId).emit('exam-ended');
    });

    // =========================
    // DISCONNECT
    // =========================
    socket.on('disconnect', async () => {
      const { roomId, userName } = socket.data;
      if (roomId) {
        socket.to(roomId).emit('user-left', { userName });
        const room = await Room.findOne({ roomId });
        const ownerId = room ? String(room.createdBy) : null;
        
        const clients = io.sockets.adapter.rooms.get(roomId);
        const users = [];
        if (clients) {
          clients.forEach(clientId => {
            const s = io.sockets.sockets.get(clientId);
            if (s && s.data.userName) {
              users.push({
                name: s.data.userName,
                isHost: ownerId && String(s.data.userId) === ownerId
              });
            }
          });
        }
        io.to(roomId).emit('active-users', users);
      }
      console.log(`❌ User disconnected: ${socket.id}`);
    });

  });
};