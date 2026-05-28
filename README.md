# simple-sse-server

Express + TypeScript server with:
- `GET /stream` for Server-Sent Events clients
- `POST /consume` to broadcast JSON payloads to all connected clients

## Run locally

```bash
npm install
npm run build
npm start
```

Server listens on `PORT` (default `3000`).

## Docker

```bash
docker build -t simple-sse-server .
docker run --rm -p 3000:3000 simple-sse-server
```