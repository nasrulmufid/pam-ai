import { GoogleGenAI } from "@google/genai";
import { readFile } from "node:fs/promises";
import { z } from "zod";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const TEMPERATURE = Number(process.env.GEMINI_TEMPERATURE || 0.7);
const MAX_OUTPUT_TOKENS = Number(process.env.GEMINI_MAX_OUTPUT_TOKENS || 8192);
const instructionsPath = new URL("../instructions-model.md", import.meta.url);

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

let systemInstructionPromise;

function getSystemInstruction() {
  systemInstructionPromise ??= readFile(instructionsPath, "utf8");
  return systemInstructionPromise;
}

function sendJson(res, statusCode, body, headers = {}) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  res.end(JSON.stringify(body));
}

async function getRequestBody(req) {
  if (req.body !== undefined) {
    if (Buffer.isBuffer(req.body)) {
      return JSON.parse(req.body.toString("utf8"));
    }
    if (typeof req.body === "string") {
      return JSON.parse(req.body);
    }
    return req.body;
  }

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(
      res,
      405,
      { error: "Method tidak diizinkan." },
      { Allow: "POST" }
    );
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error("Missing GEMINI_API_KEY in Vercel Environment Variables.");
    return sendJson(res, 500, {
      error: "Konfigurasi server belum lengkap. GEMINI_API_KEY belum tersedia."
    });
  }

  let body;
  try {
    body = await getRequestBody(req);
  } catch {
    return sendJson(res, 400, { error: "Body JSON tidak valid." });
  }

  const parsed = chatSchema.safeParse(body);
  if (!parsed.success) {
    return sendJson(res, 400, {
      error: "Invalid request",
      details: parsed.error.issues.map((issue) => issue.message)
    });
  }

  const contents = parsed.data.messages.map((message) => ({
    role: message.role,
    parts: [{ text: message.content }]
  }));

  let disconnected = false;
  req.on("close", () => {
    disconnected = true;
  });

  try {
    const systemInstruction = await getSystemInstruction();
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const stream = await ai.models.generateContentStream({
      model: MODEL,
      contents,
      config: {
        systemInstruction,
        temperature: TEMPERATURE,
        maxOutputTokens: MAX_OUTPUT_TOKENS
      }
    });

    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders?.();

    for await (const chunk of stream) {
      if (disconnected || res.destroyed || res.writableEnded) break;
      const text = chunk.text;
      if (text) res.write(text);
    }

    if (!res.writableEnded) res.end();
  } catch (error) {
    console.error("Gemini request failed on Vercel:", error);

    if (!res.headersSent) {
      return sendJson(res, 502, {
        error: "Permintaan ke penyedia AI gagal."
      });
    }

    if (!res.writableEnded) {
      res.write("\n\n[Penyedia AI mengembalikan error. Silakan coba lagi.]");
      res.end();
    }
  }
}
