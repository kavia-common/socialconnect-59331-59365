const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const app = require('./app');
const config = require('./config');
const { initDatabase, disconnectDB } = require('./config/db');
const notificationService = require('./services/notification');

(async () => {
  // Initialize DB before starting server
  await initDatabase();

  const server = http.createServer(app);

  // Socket.IO setup
  const io = new Server(server, {
    cors: {
      origin: config.socket.origins.length ? config.socket.origins : '*',
      methods: ['GET', 'POST'],
      allowedHeaders: ['Authorization'],
      credentials: true,
    },
  });

  // Initialize notification service with io
  notificationService.init(io);

  // PUBLIC_INTERFACE
  io.on('connection', (socket) => {
    /** Handle new socket connections. Attach basic listeners. */
    console.log('Socket connected:', socket.id);

    // Try to authenticate socket via token query or auth header for per-user room
    const token =
      socket.handshake.auth?.token ||
      (socket.handshake.headers['authorization'] || '').split(' ')[1] ||
      socket.handshake.query?.token;

    if (token && config.jwtSecret) {
      try {
        const payload = jwt.verify(token, config.jwtSecret);
        // Join a room named by user id to deliver notifications
        socket.join(String(payload.sub));
        socket.data.user = { id: String(payload.sub), username: payload.username };
        console.log(`Socket ${socket.id} joined room for user ${payload.sub}`);
      } catch (e) {
        console.warn('Socket auth failed:', e.message);
      }
    }

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', socket.id, 'reason:', reason);
    });
  });

  const PORT = config.port;
  const HOST = config.host;

  server.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
  });

  // Graceful shutdown
  const shutdown = async (signal) => {
    console.log(`${signal} received: closing HTTP server`);
    server.close(async () => {
      console.log('HTTP server closed');
      try {
        await disconnectDB();
        console.log('MongoDB connection closed');
      } catch (e) {
        console.error('Error closing MongoDB connection', e);
      } finally {
        process.exit(0);
      }
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  module.exports = server;
})();
