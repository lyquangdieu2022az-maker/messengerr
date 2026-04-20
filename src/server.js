import "dotenv/config";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { AiClient } from "./openaiClient.js";
import { FacebookClient } from "./facebookClient.js";
import { getFacebookFlowReply, mainHelp } from "./facebookFlows.js";
import { MemoryStore } from "./memoryStore.js";
import { ReportStore } from "./reportStore.js";
import {
  advanceReportDraft,
  buildDraftNextReply,
  buildDraftStartReply,
  buildReportCancelReply,
  buildReportFinal,
  buildReportMenu,
  createReportDraft,
  detectReportTypeFromText,
  getDraftQuickReplies,
  getReportMenuQuickReplies,
  getReportTypeFromPayload,
  isReportCancel,
  isReportMenuPayload,
  shouldStartReportAssistant
} from "./reportAssistant.js";

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

const AI_REPLY_TIMEOUT_MS = Number(process.env.AI_REPLY_TIMEOUT_MS || 30000);

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
const reportFilePath = process.env.REPORT_FILE_PATH || path.join(rootDir, "data", "reports.json");

const memoryStore = new MemoryStore(memoryFilePath, {
  maxHistoryMessages: process.env.MAX_HISTORY_MESSAGES,
  maxFacts: process.env.MAX_MEMORY_FACTS
});
const reportStore = new ReportStore(reportFilePath);

const ai = new AiClient({
  provider: process.env.AI_PROVIDER,
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.OPENAI_MODEL,
  reasoningEffort: process.env.OPENAI_REASONING_EFFORT,
  ttsModel: process.env.OPENAI_TTS_MODEL,
  transcribeModel: process.env.OPENAI_TRANSCRIBE_MODEL,
  fallbackModel: process.env.OPENAI_FALLBACK_MODEL,
  primaryTimeoutMs: process.env.OPENAI_PRIMARY_TIMEOUT_MS,
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL,
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

app.get("/reports/:id", async (req, res) => {
  const report = await reportStore.getReport(req.params.id);
  if (!report) {
    return res.status(404).send("Không tìm thấy bản soạn hoặc bản soạn đã hết hạn.");
  }

  res.type("html").send(renderReportPage(report));
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
    const answer = await answerWithFallback({ text, memory });

    await facebook.sendText(psid, answer);
    await memoryStore.updateUser(psid, (current) => ({
      ...current,
      lastSupportTopic: text
    }));
    await memoryStore.appendTurn(psid, text, answer);

    const shouldSendVoice = memory.voiceReplies ?? config.voiceRepliesDefault;
    if (shouldSendVoice && config.publicBaseUrl) {
      try {
        const audioUrl = await ai.createSpeech({
          text: answer,
          outputDir: audioDir,
          publicBaseUrl: config.publicBaseUrl
        });
        await facebook.sendAudio(psid, audioUrl);
      } catch (error) {
        console.error("Voice reply failed:", error);
      }
    }

    try {
      const latestMemory = await memoryStore.getUser(psid);
      const summary = await withTimeout(
        ai.summarizeMemory({
          memory: latestMemory,
          userText: text,
          assistantText: answer
        }),
        AI_REPLY_TIMEOUT_MS,
        "AI memory summary timed out"
      );

      await memoryStore.updateUser(psid, (current) => ({
        ...current,
        summary
      }));
    } catch (error) {
      console.error("Memory summary failed:", error);
    }
  } finally {
    await facebook.sendAction(psid, "typing_off");
  }
}

async function answerWithFallback({ text, memory }) {
  try {
    return await withTimeout(
      ai.answer({ text, memory }),
      AI_REPLY_TIMEOUT_MS,
      "AI answer timed out"
    );
  } catch (error) {
    console.error("AI answer failed:", error);
    const topicLine = memory.lastSupportTopic
      ? `Mình vẫn nhận được tin của bạn. Ngữ cảnh gần nhất mình đang giữ là: ${memory.lastSupportTopic}`
      : "Mình vẫn nhận được tin nhắn của bạn.";

    return [
      topicLine,
      "",
      "Phần AI đang gặp lỗi tạm thời nên mình chưa phân tích sâu được ngay, nhưng mình không bỏ qua tin nhắn của bạn.",
      "",
      "Bạn có thể nhắn lại theo kiểu ngắn gọn hơn để mình xử lý tiếp:",
      "1. Bạn muốn mình tư vấn, hướng dẫn, soạn nội dung, nghĩ ý tưởng hay trò chuyện?",
      "2. Nếu là Facebook/Meta, lỗi đang nằm ở tài khoản, Page, Messenger, Business hay quảng cáo?",
      "3. Nếu là chuyện khác như nấu ăn, vui chơi, học tập, bạn muốn kết quả theo kiểu nhanh gọn hay chi tiết?",
      "",
      `Tin nhắn mình vừa nhận: ${text}`,
      "",
      "Nếu đây là vấn đề khẩn cấp về bảo mật Facebook, hãy đổi mật khẩu, bật xác thực 2 yếu tố và kiểm tra thiết bị đăng nhập lạ ngay."
    ].join("\n");
  }
}

function withTimeout(promise, timeoutMs, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), timeoutMs);
    })
  ]);
}

async function extractUserText(event) {
  const message = event.message;
  const postback = event.postback;

  if (postback?.payload) {
    return postback.payload;
  }

  if (message?.quick_reply?.payload) {
    return message.quick_reply.payload;
  }

  if (message?.text) {
    return message.text.trim();
  }

  const audioAttachment = message?.attachments?.find((attachment) => attachment.type === "audio");
  const audioUrl = audioAttachment?.payload?.url;
  if (audioUrl) {
    return ai.transcribeAudioFromUrl(audioUrl);
  }

  if (message?.attachments?.length) {
    return message.attachments
      .map((attachment) => {
        const url = attachment.payload?.url;
        if (attachment.type === "image") return `Người dùng gửi ảnh/bằng chứng: ${url || "(không có link)"}`;
        if (attachment.type === "video") return `Người dùng gửi video/bằng chứng: ${url || "(không có link)"}`;
        if (attachment.type === "file") return `Người dùng gửi file/bằng chứng: ${url || "(không có link)"}`;
        return `Người dùng gửi tệp ${attachment.type || "đính kèm"}: ${url || "(không có link)"}`;
      })
      .join("\n");
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

  const reportHandled = await handleReportAssistantCommand(psid, text, normalized);
  if (reportHandled) return true;

  const flowReply = getFacebookFlowReply(normalized);
  if (flowReply) {
    await memoryStore.updateUser(psid, (memory) => ({
      ...memory,
      lastSupportTopic: text
    }));
    await memoryStore.appendTurn(psid, text, flowReply);
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

async function handleReportAssistantCommand(psid, text, normalized) {
  const memory = await memoryStore.getUser(psid);
  const activeDraft = memory.reportDraft;
  const payloadType = getReportTypeFromPayload(text);

  if (isReportCancel(text, normalized)) {
    if (!activeDraft && !text.startsWith("REPORT_")) return false;

    await memoryStore.updateUser(psid, (current) => ({
      ...current,
      reportDraft: null,
      lastSupportTopic: "Đã hủy hồ sơ báo cáo"
    }));
    await facebook.sendText(psid, buildReportCancelReply());
    return true;
  }

  if (isReportMenuPayload(text) || (shouldStartReportAssistant(normalized) && !detectReportTypeFromText(normalized))) {
    await memoryStore.updateUser(psid, (current) => ({
      ...current,
      lastSupportTopic: "Đang chọn loại báo cáo/kháng nghị"
    }));
    await facebook.sendQuickReplies(psid, buildReportMenu(), getReportMenuQuickReplies());
    return true;
  }

  if (payloadType || (shouldStartReportAssistant(normalized) && detectReportTypeFromText(normalized))) {
    const type = payloadType || detectReportTypeFromText(normalized);
    const draft = createReportDraft(type);
    if (!draft) return false;

    await memoryStore.updateUser(psid, (current) => ({
      ...current,
      reportDraft: draft,
      lastSupportTopic: `Đang tạo hồ sơ báo cáo: ${text}`
    }));
    await facebook.sendQuickReplies(psid, buildDraftStartReply(draft), getDraftQuickReplies());
    return true;
  }

  if (!activeDraft) return false;

  const result = advanceReportDraft(activeDraft, text);

  if (result.complete) {
    const finalReport = buildReportFinal(result.draft);

    await memoryStore.updateUser(psid, (current) => ({
      ...current,
      reportDraft: null,
      lastSupportTopic: "Đã soạn xong hồ sơ báo cáo/kháng nghị"
    }));
    await memoryStore.appendTurn(psid, text, finalReport.text);
    await facebook.sendText(psid, finalReport.text);
    const buttons = await buildFinalReportButtons(finalReport);
    if (buttons.length) {
      await facebook.sendButtons(psid, finalReport.buttonsText, buttons);
    }
    return true;
  }

  await memoryStore.updateUser(psid, (current) => ({
    ...current,
    reportDraft: result.draft,
    lastSupportTopic: "Đang thu thập thông tin cho hồ sơ báo cáo/kháng nghị"
  }));
  await facebook.sendQuickReplies(psid, buildDraftNextReply(result.draft), getDraftQuickReplies());
  return true;
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
  return reportStore.init();
}).then(() => {
  app.listen(config.port, () => {
    console.log(`${config.botName} is running on http://localhost:${config.port}`);
  });
});

async function buildFinalReportButtons(finalReport) {
  const buttons = [...(finalReport.buttons || [])];

  if (!config.publicBaseUrl) return buttons.slice(0, 3);

  const id = await reportStore.createReport({
    title: finalReport.title,
    text: finalReport.text,
    buttons: finalReport.buttons || []
  });
  const reportUrl = `${config.publicBaseUrl.replace(/\/$/, "")}/reports/${encodeURIComponent(id)}`;

  return [
    {
      type: "web_url",
      title: "Mở bản soạn",
      url: reportUrl
    },
    ...buttons
  ].slice(0, 3);
}

function renderReportPage(report) {
  const officialLinks = (report.buttons || [])
    .filter((button) => button.type === "web_url")
    .map((button) => `<a class="button secondary" href="${escapeAttribute(button.url)}" target="_blank" rel="noopener">${escapeHtml(button.title)}</a>`)
    .join("");

  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(report.title || "Bản soạn báo cáo")}</title>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; background: #f6f7f9; color: #17202a; }
    main { max-width: 820px; margin: 0 auto; padding: 24px 16px 40px; }
    h1 { font-size: 24px; margin: 0 0 12px; }
    p { line-height: 1.55; }
    textarea { width: 100%; min-height: 420px; box-sizing: border-box; border: 1px solid #ccd0d5; border-radius: 8px; padding: 14px; font-size: 15px; line-height: 1.5; resize: vertical; background: #fff; color: #17202a; }
    .actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; }
    .button { border: 0; border-radius: 8px; padding: 12px 14px; background: #1877f2; color: #fff; font-weight: 700; text-decoration: none; cursor: pointer; }
    .secondary { background: #263238; }
    .note { background: #fff; border-left: 4px solid #1877f2; padding: 12px; border-radius: 8px; margin: 16px 0; }
    .status { min-height: 22px; margin-top: 8px; color: #0b6b3a; font-weight: 700; }
  </style>
</head>
<body>
  <main>
    <h1>${escapeHtml(report.title || "Bản soạn báo cáo")}</h1>
    <div class="note">
      Nội dung đã được bot soạn sẵn. Bạn bấm Sao chép, mở link chính thức của Meta/Facebook, rồi dán vào ô mô tả trong form.
      Không gửi mật khẩu, mã 2FA, token, cookie hoặc giấy tờ nhạy cảm cho bot.
    </div>
    <textarea id="reportText">${escapeHtml(report.text || "")}</textarea>
    <div class="actions">
      <button class="button" id="copyButton">Sao chép nội dung</button>
      ${officialLinks}
    </div>
    <div class="status" id="status"></div>
  </main>
  <script>
    const textArea = document.getElementById("reportText");
    const status = document.getElementById("status");
    document.getElementById("copyButton").addEventListener("click", async () => {
      textArea.focus();
      textArea.select();
      try {
        await navigator.clipboard.writeText(textArea.value);
        status.textContent = "Đã sao chép. Bây giờ mở form Meta/Facebook và dán vào ô mô tả.";
      } catch {
        document.execCommand("copy");
        status.textContent = "Đã chọn nội dung. Nếu chưa copy được, giữ vào vùng chữ rồi chọn Sao chép.";
      }
    });
  </script>
</body>
</html>`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, "&#96;");
}
