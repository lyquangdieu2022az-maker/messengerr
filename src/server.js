import "dotenv/config";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { AiClient } from "./openaiClient.js";
import { FacebookClient } from "./facebookClient.js";
import { getFacebookFlowReply, mainHelp } from "./facebookFlows.js";
import { MemoryStore } from "./memoryStore.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "public");
const audioDir = path.join(publicDir, "audio");

const config = {
  port: Number(process.env.PORT || 3000),
  verifyToken: process.env.VERIFY_TOKEN,
  pageAccessToken: process.env.PAGE_ACCESS_TOKEN,
  pageId: process.env.PAGE_ID,
  appSecret: process.env.APP_SECRET,
  graphVersion: process.env.GRAPH_API_VERSION || "v25.0",
  publicBaseUrl: process.env.PUBLIC_BASE_URL,
  voiceRepliesDefault: process.env.VOICE_REPLIES_DEFAULT === "true",
  botName: process.env.BOT_NAME || "Tro Ly Facebook AI"
};

const app = express();
app.use(express.static(publicDir));
app.use(
  express.json({
    verify: (req, _res, buffer) => {
      req.rawBody = buffer;
    }
  })
);

const memoryFilePath = process.env.MEMORY_FILE_PATH || path.join(rootDir, "data", "memory.json");

const memoryStore = new MemoryStore(memoryFilePath, {
  maxHistoryMessages: process.env.MAX_HISTORY_MESSAGES,
  maxFacts: process.env.MAX_MEMORY_FACTS
});

const ai = new AiClient({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.OPENAI_MODEL,
  reasoningEffort: process.env.OPENAI_REASONING_EFFORT,
  ttsModel: process.env.OPENAI_TTS_MODEL,
  transcribeModel: process.env.OPENAI_TRANSCRIBE_MODEL,
  ttsVoice: process.env.OPENAI_TTS_VOICE,
  botName: config.botName
});

const facebook = new FacebookClient({
  pageAccessToken: config.pageAccessToken,
  pageId: config.pageId,
  graphVersion: config.graphVersion
});

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    name: config.botName,
    webhook: "/webhook"
  });
});

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === config.verifyToken) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {
  if (!isValidFacebookSignature(req)) {
    return res.sendStatus(403);
  }

  res.sendStatus(200);

  if (req.body.object !== "page") return;

  for (const entry of req.body.entry || []) {
    for (const event of entry.messaging || []) {
      handleMessagingEvent(event).catch((error) => {
        console.error("Messaging event failed:", error);
      });
    }
  }
});

async function handleMessagingEvent(event) {
  if (event.message?.is_echo) return;

  const psid = event.sender?.id;
  if (!psid) return;
  if (config.pageId && psid === config.pageId) return;
  if (!event.message && !event.postback) return;

  const text = await extractUserText(event);
  if (!text) {
    return;
  }

  const commandHandled = await handleLocalCommand(psid, text);
  if (commandHandled) return;

  try {
    await facebook.sendAction(psid, "mark_seen");
    await facebook.sendAction(psid, "typing_on");

    const memory = await memoryStore.getUser(psid);
    const answer = await ai.answer({ text, memory });

    await facebook.sendText(psid, answer);

    const shouldSendVoice = memory.voiceReplies ?? config.voiceRepliesDefault;
    if (shouldSendVoice && config.publicBaseUrl) {
      const audioUrl = await ai.createSpeech({
        text: answer,
        outputDir: audioDir,
        publicBaseUrl: config.publicBaseUrl
      });
      await facebook.sendAudio(psid, audioUrl);
    }

    const latestMemory = await memoryStore.getUser(psid);
    const summary = await ai.summarizeMemory({
      memory: latestMemory,
      userText: text,
      assistantText: answer
    });

    await memoryStore.updateUser(psid, (current) => ({
      ...current,
      summary
    }));
    await memoryStore.appendTurn(psid, text, answer);
  } finally {
    await facebook.sendAction(psid, "typing_off");
  }
}

async function extractUserText(event) {
  const message = event.message;
  const postback = event.postback;

  if (postback?.payload) {
    return `Người dùng bấm nút: ${postback.payload}`;
  }

  if (message?.text) {
    return message.text.trim();
  }

  const audioAttachment = message?.attachments?.find((attachment) => attachment.type === "audio");
  const audioUrl = audioAttachment?.payload?.url;
  if (audioUrl) {
    return ai.transcribeAudioFromUrl(audioUrl);
  }

  return "";
}

async function handleLocalCommand(psid, rawText) {
  const text = rawText.trim();
  const normalized = normalizeCommand(text);

  if (["help", "tro giup", "bat dau"].includes(normalized)) {
    await facebook.sendText(psid, mainHelp(config.botName));
    return true;
  }

  const flowReply = getFacebookFlowReply(normalized);
  if (flowReply) {
    await facebook.sendText(psid, flowReply);
    return true;
  }

  if (normalized.startsWith("nho rang ")) {
    const fact = text.split(/\s+/).slice(2).join(" ").trim();
    if (fact) {
      await memoryStore.addFact(psid, fact);
      await facebook.sendText(psid, "Mình đã ghi nhớ thông tin này cho những lần trả lời sau.");
    }
    return true;
  }

  if (["quen toi", "xoa ghi nho"].includes(normalized)) {
    await memoryStore.forgetUser(psid);
    await facebook.sendText(psid, "Mình đã xóa ghi nhớ hội thoại của bạn trên bot này.");
    return true;
  }

  if (["bat giong noi", "voice on"].includes(normalized)) {
    await memoryStore.setVoiceReplies(psid, true);
    await facebook.sendText(
      psid,
      config.publicBaseUrl
        ? "Đã bật trả lời bằng giọng nói AI. Mình vẫn gửi kèm văn bản để bạn dễ xem lại."
        : "Mình đã bật tùy chọn giọng nói, nhưng bạn cần cấu hình PUBLIC_BASE_URL để Facebook tải được file audio."
    );
    return true;
  }

  if (["tat giong noi", "voice off"].includes(normalized)) {
    await memoryStore.setVoiceReplies(psid, false);
    await facebook.sendText(psid, "Đã tắt trả lời bằng giọng nói.");
    return true;
  }

  return false;
}

function isValidFacebookSignature(req) {
  if (!config.appSecret) return true;

  const signature = req.get("x-hub-signature-256");
  if (!signature?.startsWith("sha256=")) return false;

  const expected = crypto
    .createHmac("sha256", config.appSecret)
    .update(req.rawBody)
    .digest("hex");

  const received = signature.slice("sha256=".length);
  return safeEqualHex(received, expected);
}

function safeEqualHex(received, expected) {
  const receivedBuffer = Buffer.from(received, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  if (receivedBuffer.length !== expectedBuffer.length) return false;
  return crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
}

function normalizeCommand(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d")
    .replace(/\s+/g, " ")
    .trim();
}

memoryStore.init().then(() => {
  app.listen(config.port, () => {
    console.log(`${config.botName} is running on http://localhost:${config.port}`);
  });
});
