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

    return response.output_text?.trim() || "Minh chua tao duoc cau tra loi. Ban gui lai giup minh nhe.";
  }

  async summarizeMemory({ memory, userText, assistantText }) {
    const response = await this.client.responses.create({
      model: this.model,
      reasoning: { effort: "low" },
      input: [
        {
          role: "developer",
          content: "Tom tat ngan gon bang tieng Viet cac thong tin ben vung nen nho cho lan sau. Khong luu bi mat, token, mat khau, ma 2FA, cookie hoac giay to nhay cam. Toi da 120 tu."
        },
        {
          role: "user",
          content: `Tom tat cu:\n${memory.summary || "(trong)"}\n\nTin nhan moi cua nguoi dung:\n${userText}\n\nCau tra loi cua bot:\n${assistantText}`
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
      instructions: "Noi tieng Viet ro rang, binh tinh, than thien. Day la giong noi AI, khong phai nguoi that."
    });

    const buffer = Buffer.from(await audio.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    return `${publicBaseUrl.replace(/\/$/, "")}/audio/${fileName}`;
  }
}
