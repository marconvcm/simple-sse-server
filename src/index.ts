import express, { Request, Response } from "express";

const app = express();
const port = Number(process.env.PORT ?? 3000);
const clients = new Set<Response>();

app.use(express.json());

app.get("/stream", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  clients.add(res);
  res.write(`data: ${JSON.stringify({ connected: true })}\n\n`);

  res.on("close", () => {
    clients.delete(res);
  });

  res.on("error", () => {
    clients.delete(res);
  });
});

app.post("/consume", (req: Request, res: Response) => {
  if (!req.is("application/json")) {
    res.status(415).json({ error: "Content-Type must be application/json" });
    return;
  }

  const payload = req.body;
  const data = `data: ${JSON.stringify(payload)}\n\n`;
  let deliveredTo = 0;

  for (const client of clients) {
    if (client.writableEnded) {
      clients.delete(client);
      continue;
    }

    try {
      client.write(data);
      deliveredTo += 1;
    } catch (_error) {
      clients.delete(client);
    }
  }

  res.status(202).json({ deliveredTo });
});

app.listen(port, () => {
  console.log(`SSE server listening on port ${port}`);
});
