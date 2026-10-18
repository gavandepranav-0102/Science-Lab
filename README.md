# SciLab AI — Combined Frontend + Backend

This archive contains both supplied projects:

- `frontend/SciLab_AI_Vite/` — Vite frontend (vanilla JavaScript, HTML, CSS).
- `backend/SciLab_AI_Backend/` — Node.js + Express REST API.

## Requirements

- Node.js (LTS recommended) and npm.
- Internet access for installing npm packages and loading external fonts/GSAP/CDN assets.

## 1. Start the backend (Terminal 1 — PowerShell in VS Code)

```powershell
cd backend/SciLab_AI_Backend
npm install
Copy-Item .env.example .env
```

Open `backend/SciLab_AI_Backend/.env` and set `JWT_SECRET` to a long random development secret. Then run:

```powershell
npm run dev
```

The API listens on `http://localhost:4000`. Check `http://localhost:4000/api/health` in a browser.

If PowerShell says the `.env` file already exists, do not overwrite it; edit the existing file instead.

## 2. Start the frontend (Terminal 2 — separate terminal)

```powershell
cd frontend/SciLab_AI_Vite
npm install
npm run dev
```

Open the Vite URL printed in the terminal, normally `http://localhost:5173`.

## 3. Database used

The backend currently uses **JSON-file storage**, not PostgreSQL, MySQL, or MongoDB. Data files are in `backend/SciLab_AI_Backend/data/` (`users.json`, `history.json`, `sessions.json`, and `blacklist.json`). Back up these files if you need to preserve local data. This is suitable for a demo/local run, but a multi-user production deployment should use a real database.

## Important integration note

Both supplied codebases are included in this archive. The backend API is documented in `backend/SciLab_AI_Backend/API.md`. The frontend package is a separate Vite app, and the supplied frontend source contains existing client-side authentication/AI request logic; simply putting both folders in one ZIP does **not** automatically connect every frontend flow to the backend. API integration may require replacing those existing flows with calls to the backend endpoints. The optional helper `backend/SciLab_AI_Backend/src/frontend-api.js` documents the available client API methods.

## Build the frontend

```powershell
cd frontend/SciLab_AI_Vite
npm run build
```

## Troubleshooting

- If port `4000` is occupied, change `PORT` in the backend `.env` and update any frontend API base URL when integrating the API.
- If frontend requests to the API are blocked by CORS, ensure `CLIENT_ORIGIN=http://localhost:5173` in the backend `.env` matches the actual Vite origin.
- The backend's optional AI chat proxy needs `ANTHROPIC_API_KEY` configured in the backend `.env`; leave it blank if you do not use that feature.
- This package has been combined and basic syntax/ZIP checks are performed, but no software package can be guaranteed completely bug-free in every machine/environment.
