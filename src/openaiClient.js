import fs from "node:fs/promises";
import path from "node:path";
import OpenAI, { toFile } from "openai";
import { buildDeveloperPrompt, buildMemoryContext } from "./prompt.js";

export class AiClient {
  constructor(config) {
    this.client = new OpenAI({ apiKey: config.apiKey });
    this.model = config.model || "gpt-5.4";
    this.reasoningEffort = config.reasoningEffort || "medium";
    this.ttsModel = config.ttsModel || "gpt-4o-mini-tts";
    this.transcribeModel = config.transcribeModel || "gpt-4o-mini-transcribe";
    this.ttsVoice = config.ttsVoice || "marin";
    this.botName = config.botName || "Tro Ly Facebook AI";
  }

  async answer({ text, memory }) {
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

    const response = await this.client.responses.create({
      model: this.model,
      reasoning: { effort: this.reasoningEffort },
      input
    });

    return response.output_text?.trim() || "Mình chưa tạo được câu trả lời. Bạn gửi lại giúp mình nhé.";
  }

  async summarizeMemory({ memory, userText, assistantText }) {
    const response = await this.client.responses.create({
      model: this.model,
      reasoning: { effort: "low" },
      input: [
        {
          role: "developer",
          content: "Tóm tắt ngắn gọn bằng tiếng Việt có dấu các thông tin bền vững nên nhớ cho lần sau. Không lưu bí mật, token, mật khẩu, mã 2FA, cookie hoặc giấy tờ nhạy cảm. Tối đa 120 từ."
        },
        {
          role: "user",
          content: `Tóm tắt cũ:\n${memory.summary || "(trống)"}\n\nTin nhắn mới của người dùng:\n${userText}\n\nCâu trả lời của bot:\n${assistantText}`
        }
      ]
    });

    return response.output_text?.trim() || memory.summary || "";
  }

  async transcribeAudioFromUrl(audioUrl) {
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
}
