import fs from "node:fs/promises";
import path from "node:path";

const EMPTY_MEMORY = {
  facts: [],
  summary: "",
  history: [],
  lastSupportTopic: "",
  reportDraft: null,
  voiceReplies: null,
  updatedAt: null
};

export class MemoryStore {
  constructor(filePath, options = {}) {
    this.filePath = filePath;
    this.maxHistoryMessages = Number(options.maxHistoryMessages ?? 16);
    this.maxFacts = Number(options.maxFacts ?? 40);
    this.writeQueue = Promise.resolve();
  }

  async init() {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });

    try {
      await fs.access(this.filePath);
    } catch {
      await fs.writeFile(this.filePath, JSON.stringify({ users: {} }, null, 2));
    }
  }

  async getUser(psid) {
    const db = await this.readDb();
    return {
      ...EMPTY_MEMORY,
      ...(db.users[psid] || {})
    };
  }

  async updateUser(psid, updater) {
    this.writeQueue = this.writeQueue.then(async () => {
      const db = await this.readDb();
      const current = {
        ...EMPTY_MEMORY,
        ...(db.users[psid] || {})
      };
      const next = await updater(current);
      db.users[psid] = {
        ...EMPTY_MEMORY,
        ...next,
        facts: [...new Set((next.facts || []).map((fact) => fact.trim()).filter(Boolean))].slice(-this.maxFacts),
        history: (next.history || []).slice(-this.maxHistoryMessages),
        updatedAt: new Date().toISOString()
      };
      await fs.writeFile(this.filePath, JSON.stringify(db, null, 2));
    });

    return this.writeQueue;
  }

  async forgetUser(psid) {
    await this.updateUser(psid, () => ({ ...EMPTY_MEMORY }));
  }

  async appendTurn(psid, userText, assistantText) {
    await this.updateUser(psid, (memory) => ({
      ...memory,
      history: [
        ...(memory.history || []),
        { role: "user", content: userText },
        { role: "assistant", content: assistantText }
      ].slice(-this.maxHistoryMessages)
    }));
  }

  async addFact(psid, fact) {
    await this.updateUser(psid, (memory) => ({
      ...memory,
      facts: [...(memory.facts || []), fact].slice(-this.maxFacts)
    }));
  }

  async setVoiceReplies(psid, enabled) {
    await this.updateUser(psid, (memory) => ({
      ...memory,
      voiceReplies: enabled
    }));
  }

  async readDb() {
    await this.init();
    const raw = await fs.readFile(this.filePath, "utf8");
    const db = JSON.parse(raw || "{}");
    return {
      users: db.users || {}
    };
  }
}
