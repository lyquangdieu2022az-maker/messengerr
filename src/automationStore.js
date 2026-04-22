import fs from "node:fs/promises";
import path from "node:path";

const EMPTY_AUTOMATION_STATE = {
  autoPosts: {},
  repliedComments: {},
  updatedAt: null
};

export class AutomationStore {
  constructor(filePath, options = {}) {
    this.filePath = filePath;
    this.commentTtlDays = Number(options.commentTtlDays || 14);
    this.writeQueue = Promise.resolve();
  }

  async init() {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });

    try {
      await fs.access(this.filePath);
    } catch {
      await fs.writeFile(this.filePath, JSON.stringify(EMPTY_AUTOMATION_STATE, null, 2));
    }
  }

  async hasAutoPost(slotKey) {
    const db = await this.readDb();
    return Boolean(db.autoPosts?.[slotKey]);
  }

  async saveAutoPost(slotKey, data) {
    await this.update((db) => {
      db.autoPosts[slotKey] = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      return db;
    });
  }

  async hasRepliedComment(commentId) {
    const db = await this.readDb();
    return Boolean(db.repliedComments?.[commentId]);
  }

  async saveRepliedComment(commentId, data) {
    await this.update((db) => {
      db.repliedComments[commentId] = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      pruneOldComments(db.repliedComments, this.commentTtlDays);
      return db;
    });
  }

  async update(updater) {
    this.writeQueue = this.writeQueue.then(async () => {
      const db = await this.readDb();
      const next = await updater(db);
      next.updatedAt = new Date().toISOString();
      await fs.writeFile(this.filePath, JSON.stringify(next, null, 2));
    });

    return this.writeQueue;
  }

  async readDb() {
    await this.init();
    const raw = await fs.readFile(this.filePath, "utf8");
    const db = JSON.parse(raw || "{}");
    return {
      ...EMPTY_AUTOMATION_STATE,
      ...db,
      autoPosts: db.autoPosts || {},
      repliedComments: db.repliedComments || {}
    };
  }
}

function pruneOldComments(repliedComments, ttlDays) {
  const cutoff = Date.now() - ttlDays * 24 * 60 * 60 * 1000;

  for (const [commentId, value] of Object.entries(repliedComments)) {
    const timestamp = Date.parse(value.updatedAt || value.repliedAt || "");
    if (Number.isFinite(timestamp) && timestamp < cutoff) {
      delete repliedComments[commentId];
    }
  }
}
