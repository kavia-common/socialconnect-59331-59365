const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const config = require('./config');
const { initDatabase, disconnectDB } = require('./config/db');

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

  // PUBLIC_INTERFACE
  io.on('connection', (socket) => {
    /** Handle new socket connections. Attach basic listeners. */
    console.log('Socket connected:', socket.id);

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
