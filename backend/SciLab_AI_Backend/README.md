# SciLab AI Backend

Express backend for the SciLab AI Vite application.

## Features

- Register / login / logout
- JWT authentication in an HttpOnly cookie
- bcrypt password hashing
- Refresh-free session model with JWT expiration
- Change password
- Forgot/reset password flow for development/demo use
- Guest session endpoint
- Current-user endpoint
- Experiment history per user
- Save experiment results
- Delete history
- Login audit events
- Server-side AI chat proxy
- CORS, Helmet and rate limiting
- JSON-file persistence (easy to run on a phone without MongoDB)
- Central error handling
- Health endpoint

## Important

Passwords are NEVER stored in plain text.
The browser does not need to know the JWT secret.
The Anthropic API key, when configured, stays on the server.

For a production deployment, replace the JSON data layer with PostgreSQL/MongoDB
and use HTTPS. The forgot-password endpoint here is intentionally a demo flow;
a production version should send a time-limited reset token by email.

## Setup

```bash
npm install
cp .env.example .env
# edit .env and set JWT_SECRET
npm run dev
```

Server:
http://localhost:4000

Health:
GET /api/health

## Auth API

POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
POST /api/auth/guest
POST /api/auth/change-password
POST /api/auth/forgot-password
POST /api/auth/reset-password

## User API

GET /api/users/me
GET /api/users/me/logins

## Experiment API

GET    /api/experiments/history
GET    /api/experiments/history/:id
POST   /api/experiments/history
DELETE /api/experiments/history/:id
DELETE /api/experiments/history

## AI API

POST /api/ai/chat

The frontend should send credentials:
```js
fetch('http://localhost:4000/api/auth/login', {
  method: 'POST',
  credentials: 'include',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({ email, password })
});
```

For all authenticated calls:
```js
fetch('http://localhost:4000/api/auth/me', {
  credentials: 'include'
});
```
