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

  _req.on("close", () => {
    clients.delete(res);
  });
});

app.post("/consume", (req: Request, res: Response) => {
  const payload = req.body;
  const data = `data: ${JSON.stringify(payload)}\n\n`;

  for (const client of clients) {
    client.write(data);
  }

  res.status(202).json({ deliveredTo: clients.size });
});

app.listen(port, () => {
  console.log(`SSE server listening on port ${port}`);
});
