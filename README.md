# socialconnect-59331-59365

Environment configuration

This project uses environment variables for backend_api and frontend_app. Copy the provided .env.example files and fill in values for your environment.

Backend (Express) - socialconnect-59331-59365/backend_api
1) Create .env from example
cp backend_api/.env.example backend_api/.env

2) Variables (all required unless noted):
- PORT: Port the backend server listens on (default 3001)
- HOST: Host/IP to bind (default 0.0.0.0)
- NODE_ENV: Environment name (development|production|test)
- JWT_SECRET: Strong random string used to sign JWT tokens
- MONGODB_URI: Mongo connection string (e.g., mongodb://localhost:27017 or Atlas URI)
- MONGODB_DB: Database name (e.g., socialconnect)
- CLOUDINARY_CLOUD_NAME: Cloudinary cloud name
- CLOUDINARY_API_KEY: Cloudinary API key
- CLOUDINARY_API_SECRET: Cloudinary API secret
- CORS_ORIGIN: Comma-separated list of allowed origins for REST (e.g., http://localhost:3000)
- SOCKET_CORS_ORIGIN: Comma-separated list of allowed origins for Socket.IO (e.g., http://localhost:3000)

Notes:
- Do not commit real secrets. The .env file is environment-specific.
- Obtain Cloudinary credentials at https://cloudinary.com/console

Frontend (React) - socialconnect-59331-59367/frontend_app
1) Create .env from example
cp ../socialconnect-59331-59367/frontend_app/.env.example ../socialconnect-59331-59367/frontend_app/.env

2) Variables:
- REACT_APP_API_BASE_URL: Base URL for backend REST API (e.g., http://localhost:3001)
- REACT_APP_SOCKET_URL: Socket.IO base URL for real-time updates (e.g., http://localhost:3001)
- REACT_APP_CLOUDINARY_UPLOAD_PRESET: Unsigned Cloudinary upload preset name (create in Cloudinary settings)

Environment variable sources
- Backend loads variables with dotenv (ensure server loads process.env early).
- Database connection should use MONGODB_URI and MONGODB_DB.
- Media uploads require Cloudinary keys on backend and the unsigned preset on frontend if client-side uploads are used.

Security reminders
- Use strong, unique JWT_SECRET per environment.
- Restrict CORS_ORIGIN and SOCKET_CORS_ORIGIN to trusted domains in production.
- Never commit .env files with secrets.

Running locally (example)
Backend:
- Copy and edit backend_api/.env
- npm install
- npm run dev

Frontend:
- Copy and edit frontend_app/.env
- npm install
- npm start
