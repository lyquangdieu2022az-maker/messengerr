import fs from "node:fs/promises";
import path from "node:path";
import OpenAI, { toFile } from "openai";
import { buildDeveloperPrompt, buildMemoryContext } from "./prompt.js";

export class AiClient {
  constructor(config) {
    const requestedProvider = (config.provider || "").trim().toLowerCase();
    this.client = config.apiKey ? new OpenAI({ apiKey: config.apiKey }) : null;
    this.geminiApiKey = config.geminiApiKey;
    this.provider = requestedProvider || (this.geminiApiKey && !this.client ? "gemini" : "openai");
    if (this.provider !== "gemini" && !this.client && this.geminiApiKey) {
      console.warn("OPENAI_API_KEY is missing, switching AI provider to Gemini.");
      this.provider = "gemini";
    }
    this.model = config.model || "gpt-5.4";
    this.fallbackModel = config.fallbackModel || "gpt-4o-mini";
    this.primaryTimeoutMs = Number(config.primaryTimeoutMs || 12000);
    this.geminiModel = config.geminiModel || "gemini-2.5-flash-lite";
    this.geminiFallbackModels = parseCsv(config.geminiFallbackModels || "gemini-2.5-flash");
    this.geminiMaxRetries = Number(config.geminiMaxRetries || 1);
    this.reasoningEffort = config.reasoningEffort || "medium";
    this.ttsModel = config.ttsModel || "gpt-4o-mini-tts";
    this.transcribeModel = config.transcribeModel || "gpt-4o-mini-transcribe";
    this.ttsVoice = config.ttsVoice || "marin";
    this.botName = config.botName || "Tro Ly Facebook AI";
  }

  async answer({ text, memory }) {
    if (this.provider === "gemini") {
      return this.answerWithGemini({ text, memory });
    }

    const input = [
      {
        role: "developer",
        content: buildDeveloperPrompt({ botName: this.botName })
      },
      {
        role: "developer",
        content: buildMemoryContext(memory)
      },
      ...memory.history.map((message) => ({
        role: message.role,
        content: message.content
      })),
      {
        role: "user",
        content: text
      }
    ];

    const response = await this.createResponseWithFallback(input, this.reasoningEffort);

    return response.output_text?.trim() || "Em chưa tạo được câu trả lời. Anh/Chị gửi lại giúp em nhé.";
  }

  async summarizeMemory({ memory, userText, assistantText }) {
    if (this.provider === "gemini") {
      const summary = await this.generateGeminiText([
        {
          role: "user",
          parts: [
            {
              text: [
                "Tóm tắt ngắn gọn bằng tiếng Việt có dấu các thông tin bền vững nên nhớ cho lần sau.",
                "Không lưu bí mật, token, mật khẩu, mã 2FA, cookie hoặc giấy tờ nhạy cảm. Tối đa 120 từ.",
                "",
                `Tóm tắt cũ:\n${memory.summary || "(trống)"}`,
                "",
                `Tin nhắn mới của người dùng:\n${userText}`,
                "",
                `Câu trả lời của bot:\n${assistantText}`
              ].join("\n")
            }
          ]
        }
      ]);

      return summary || memory.summary || "";
    }

    const response = await this.createResponseWithFallback(
      [
        {
          role: "developer",
          content: "Tóm tắt ngắn gọn bằng tiếng Việt có dấu các thông tin bền vững nên nhớ cho lần sau. Không lưu bí mật, token, mật khẩu, mã 2FA, cookie hoặc giấy tờ nhạy cảm. Tối đa 120 từ."
        },
        {
          role: "user",
          content: `Tóm tắt cũ:\n${memory.summary || "(trống)"}\n\nTin nhắn mới của người dùng:\n${userText}\n\nCâu trả lời của bot:\n${assistantText}`
        }
      ],
      "low"
    );

    return response.output_text?.trim() || memory.summary || "";
  }

  async createResponseWithFallback(input, effort) {
    if (!this.client) {
      throw new Error("OPENAI_API_KEY is missing.");
    }

    try {
      return await withTimeout(
        this.client.responses.create({
          model: this.model,
          reasoning: { effort },
          input
        }),
        this.primaryTimeoutMs,
        `Primary OpenAI model timed out after ${this.primaryTimeoutMs}ms`
      );
    } catch (error) {
      if (!this.fallbackModel || this.fallbackModel === this.model) {
        throw error;
      }

      console.error(`Primary OpenAI model failed (${this.model}), retrying with ${this.fallbackModel}:`, error);
      return this.client.responses.create({
        model: this.fallbackModel,
        input
      });
    }
  }

  async answerWithGemini({ text, memory }) {
    const contents = [
      {
        role: "user",
        parts: [
          {
            text: [
              buildDeveloperPrompt({ botName: this.botName }),
              "",
              buildMemoryContext(memory)
            ].join("\n")
          }
        ]
      },
      ...memory.history.map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: [{ text: message.content }]
      })),
      {
        role: "user",
        parts: [{ text }]
      }
    ];

    const responseText = await this.generateGeminiText(contents);
    return responseText || "Em chưa tạo được câu trả lời. Anh/Chị gửi lại giúp em nhé.";
  }

  async generateGeminiText(contents) {
    if (!this.geminiApiKey) {
      throw new Error("GEMINI_API_KEY is missing.");
    }

    const models = [this.geminiModel, ...this.geminiFallbackModels].filter(
      (model, index, all) => model && all.indexOf(model) === index
    );
    let lastError = null;

    for (const model of models) {
      for (let attempt = 0; attempt <= this.geminiMaxRetries; attempt += 1) {
        try {
          return await this.callGeminiModel({ model, contents });
        } catch (error) {
          lastError = error;
          const canRetry = isRetryableGeminiError(error) && attempt < this.geminiMaxRetries;
          if (!canRetry) break;

          const delayMs = 700 * (attempt + 1);
          console.warn(`Gemini model ${model} failed temporarily, retrying in ${delayMs}ms:`, error.message);
          await sleep(delayMs);
        }
      }

      if (models.length > 1) {
        console.warn(`Gemini model ${model} failed, trying fallback model if available:`, lastError?.message);
      }
    }

    throw lastError || new Error("Gemini API failed.");
  }

  async callGeminiModel({ model, contents }) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(this.geminiApiKey)}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.45,
          topP: 0.9
        }
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      const error = new Error(`Gemini API failed for ${model}: ${response.status} ${errorBody}`);
      error.status = response.status;
      throw error;
    }

    const data = await response.json();
    return (
      data.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("")
        .trim() || ""
    );
  }

  async transcribeAudioFromUrl(audioUrl) {
    if (!this.client) {
      throw new Error("OPENAI_API_KEY is required for Messenger audio transcription.");
    }

    const response = await fetch(audioUrl);
    if (!response.ok) {
      throw new Error(`Could not download Messenger audio: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const file = await toFile(buffer, "messenger-audio.mp3");

    const transcription = await this.client.audio.transcriptions.create({
      model: this.transcribeModel,
      file
    });

    return transcription.text?.trim() || "";
  }

  async createSpeech({ text, outputDir, publicBaseUrl }) {
    if (!this.client) {
      throw new Error("OPENAI_API_KEY is required for voice replies.");
    }

    await fs.mkdir(outputDir, { recursive: true });

    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.mp3`;
    const filePath = path.join(outputDir, fileName);
    const speechText = text.length > 3000 ? `${text.slice(0, 2990)}...` : text;

    const audio = await this.client.audio.speech.create({
      model: this.ttsModel,
      voice: this.ttsVoice,
      input: speechText,
      instructions: "Nói tiếng Việt rõ ràng, bình tĩnh, thân thiện. Đây là giọng nói AI, không phải người thật."
    });

    const buffer = Buffer.from(await audio.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    return `${publicBaseUrl.replace(/\/$/, "")}/audio/${fileName}`;
  }

  canCreateSpeech() {
    return Boolean(this.client);
  }

  canTranscribeAudio() {
    return Boolean(this.client);
  }
}

function parseCsv(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isRetryableGeminiError(error) {
  return [500, 502, 503, 504].includes(error.status);
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function withTimeout(promise, timeoutMs, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), timeoutMs);
    })
  ]);
}
