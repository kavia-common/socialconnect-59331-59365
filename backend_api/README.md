# Backend API - Core Infrastructure

This backend is an Express server connected to MongoDB via Mongoose, with JWT authentication middleware scaffolding and Socket.IO for real-time features.

Key components:
- Express app with JSON body parsing and CORS configured via env.
- Mongoose connection using MONGODB_URI and MONGODB_DB.
- Core models: User, Post, Comment, Notification, Follow, Like.
- JWT auth middleware scaffold that attaches decoded payload to req.user.
- Socket.IO server initialized in src/server.js, CORS controlled by SOCKET_CORS_ORIGIN.
- Swagger docs hosted at /docs.

Environment variables (see project root README for details) must be set in backend_api/.env.
