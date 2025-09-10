# Backend API - Core Infrastructure

This backend is an Express server connected to MongoDB via Mongoose, with JWT authentication middleware scaffolding and Socket.IO for real-time features.

Key components:
- Express app with JSON body parsing and CORS configured via env.
- Mongoose connection using MONGODB_URI and MONGODB_DB.
- Core models: User, Post, Comment, Notification, Follow.
- JWT auth middleware scaffolding that attaches decoded payload to req.user.
- Socket.IO server initialized in src/server.js, CORS controlled by SOCKET_CORS_ORIGIN.
- Swagger docs hosted at /docs.

New Feature Routes:
- Auth: POST /auth/signup, POST /auth/login, GET /auth/me, POST /auth/logout
- Users: GET /users/search?q=, GET /users/:username, PUT /users/me/profile
- Follows: POST /follows/:username, DELETE /follows/:username, GET /follows/:username/followers, GET /follows/:username/following
- Posts: POST /posts, DELETE /posts/:id, GET /posts/:id, GET /posts/by/:username, GET /posts/feed/me, GET /posts/explore, GET /posts/search?q=, POST /posts/:id/comments
- Notifications: GET /notifications, POST /notifications/:id/read

Socket.IO Notifications:
- Client should connect with auth token (JWT):
  const socket = io(API_URL, { auth: { token: jwt } });
  // Alternatively, send header: { extraHeaders: { Authorization: `Bearer ${jwt}` } }
- On successful auth, the server joins the socket to a room named by the user's id.
- New notifications are emitted as 'notification:new' to the user's room with payload:
  { id, type: 'like'|'comment'|'follow', actor, post, comment, createdAt, isRead, metadata }
- Server also emits 'connection:ack' upon successful connection with { ok: true, userId }.

Environment variables (see project root README for details) must be set in backend_api/.env.
