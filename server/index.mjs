import "dotenv/config";
import compression from "compression";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { GoogleGenAI } from "@google/genai";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const distDir = path.join(projectRoot, "dist");
const instructionsPath = path.join(projectRoot, "instructions-model.md");

const PORT = Number(process.env.PORT || 3001);
const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";
const TEMPERATURE = Number(process.env.GEMINI_TEMPERATURE || 0.7);
const MAX_OUTPUT_TOKENS = Number(process.env.GEMINI_MAX_OUTPUT_TOKENS || 8192);

if (!process.env.GEMINI_API_KEY) {
  console.error("Missing GEMINI_API_KEY. Copy .env.example to .env and set the key.");
  process.exit(1);
}

const systemInstruction = await readFile(instructionsPath, "utf8");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      fontSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(express.json({ limit: "256kb" }));

const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000),
  limit: Number(process.env.RATE_LIMIT_MAX || 30),
  standardHeaders: "draft-8",
  legacyHeaders: false
});
app.use("/api", limiter);

const messageSchema = z.object({
  role: z.enum(["user", "model"]),
  content: z.string().trim().min(1).max(12_000)
});

const chatSchema = z.object({
  messages: z.array(messageSchema).min(1).max(60)
}).superRefine((value, ctx) => {
  const total = value.messages.reduce((sum, message) => sum + message.content.length, 0);
  if (total > 100_000) {
    ctx.addIssue({ code: "custom", message: "Conversation is too large." });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, model: MODEL });
});

app.post("/api/chat", async (req, res) => {
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid request",
      details: parsed.error.issues.map((issue) => issue.message)
    });
  }

  const contents = parsed.data.messages.map((message) => ({
    role: message.role,
    parts: [{ text: message.content }]
  }));

  res.status(200);
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  let disconnected = false;
  res.on("close", () => {
    if (!res.writableEnded) disconnected = true;
  });

  try {
    const stream = await ai.models.generateContentStream({
      model: MODEL,
      contents,
      config: {
        systemInstruction,
        temperature: TEMPERATURE,
        maxOutputTokens: MAX_OUTPUT_TOKENS
      }
    });

    for await (const chunk of stream) {
      if (disconnected) break;
      const text = chunk.text;
      if (text) {
        res.write(text);
        res.flush?.();
      }
    }

    if (!res.writableEnded) res.end();
  } catch (error) {
    console.error("Gemini request failed:", error);
    if (!res.headersSent) {
      return res.status(502).json({ error: "Permintaan ke penyedia AI gagal." });
    }
    if (!res.writableEnded) {
      res.write("\n\n[Penyedia AI mengembalikan error. Silakan coba lagi.]");
      res.end();
    }
  }
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(distDir, {
    maxAge: "1y",
    immutable: true,
    index: false
  }));

  app.get("/{*splat}", (_req, res) => {
    res.setHeader("Cache-Control", "no-cache");
    res.sendFile(path.join(distDir, "index.html"));
  });
}

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "Internal server error." });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Gemini Chat server listening on http://0.0.0.0:${PORT}`);
  console.log(`Model: ${MODEL}`);
});
