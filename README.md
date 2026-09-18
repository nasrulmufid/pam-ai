# Gemini Chat Modern

Production-oriented, mobile-friendly AI chat app built with React, shadcn-style components, Tailwind CSS, Express, and the Gemini API.

## Features

- Responsive ChatGPT-inspired interface for desktop and mobile
- Dark/light theme
- Multiple conversations, search, new chat, delete chat
- Conversation history persisted in browser `localStorage`
- Streaming Gemini responses
- Markdown + GitHub Flavored Markdown rendering
- Stop generation and copy message controls
- API key stays server-side
- `instructions-model.md` is loaded as Gemini `systemInstruction`
- Basic production security headers, request validation, JSON limits, and API rate limiting
- Docker production deployment

## Requirements

- Node.js 22+ recommended
- Gemini API key from Google AI Studio

## Local development

```bash
cp .env.example .env
# edit .env and set GEMINI_API_KEY
npm install
npm run dev
```

Open `http://localhost:5173`.

Vite proxies `/api` to the Express server on port 3001.

## Production without Docker

```bash
cp .env.example .env
npm install
npm run build
npm start
```

Open `http://localhost:3001`.

## Production with Docker Compose

```bash
cp .env.example .env
# edit .env and set GEMINI_API_KEY
docker compose up -d --build
```

Then open `http://YOUR_SERVER_IP:3001`.

For a public deployment, put the app behind a TLS reverse proxy such as Nginx, Caddy, Cloudflare Tunnel, or your platform's HTTPS ingress.

## Model instructions

Edit `instructions-model.md` to define the AI role and behavior. The file is loaded when the Node server starts, so restart the server/container after changing it.

## Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | Yes | - | Server-side Gemini API key |
| `GEMINI_MODEL` | No | `gemini-2.5-flash` | Gemini model endpoint |
| `PORT` | No | `3001` | Production HTTP port |
| `GEMINI_TEMPERATURE` | No | `0.7` | Sampling temperature |
| `GEMINI_MAX_OUTPUT_TOKENS` | No | `8192` | Response token ceiling |
| `RATE_LIMIT_WINDOW_MS` | No | `60000` | API rate-limit window |
| `RATE_LIMIT_MAX` | No | `30` | Requests allowed per window/IP |

## Storage note

Conversation history is intentionally stored in `localStorage`. It is browser/device-specific and is not synchronized between devices. Clearing browser site data removes the saved chats.

## Security notes

- Never put `GEMINI_API_KEY` in a `VITE_*` variable; Vite variables are bundled into browser code.
- Keep `.env` out of source control.
- For internet-facing deployments, use HTTPS and consider authentication plus a persistent server-side usage quota if multiple users will access the app.
