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

  // Socket authentication middleware:
  // Verifies JWT provided via handshake.auth.token or Authorization header or query token.
  io.use((socket, next) => {
    try {
      const headerToken =
        (socket.handshake.headers['authorization'] || '').split(' ')[1] || null;
      const token =
        socket.handshake.auth?.token ||
        headerToken ||
        socket.handshake.query?.token;

      if (!token) {
        const err = new Error('Authentication token missing');
        err.data = { code: 'AUTH_MISSING' };
        return next(err);
      }
      if (!config.jwtSecret) {
        const err = new Error('Server misconfiguration');
        err.data = { code: 'SERVER_CONFIG' };
        return next(err);
      }
      const payload = jwt.verify(token, config.jwtSecret);
      socket.data.user = {
        id: String(payload.sub),
        username: payload.username,
        email: payload.email,
      };
      return next();
    } catch (e) {
      const err = new Error('Invalid token');
      err.data = { code: 'AUTH_INVALID' };
      return next(err);
    }
  });

  // Initialize notification service with io
  notificationService.init(io);

  // PUBLIC_INTERFACE
  io.on('connection', (socket) => {
    /** Handle new socket connections. Attach basic listeners. */
    const userId = socket.data?.user?.id;
    console.log('Socket connected:', socket.id, 'user:', userId || 'anon');

    // Join per-user room when authenticated
    if (userId) {
      socket.join(String(userId));
      console.log(`Socket ${socket.id} joined room for user ${userId}`);
      // Optional: send initial handshake/ack
      socket.emit('connection:ack', { ok: true, userId });
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
