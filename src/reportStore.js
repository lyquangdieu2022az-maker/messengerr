import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

export class ReportStore {
  constructor(filePath) {
    this.filePath = filePath;
    this.writeQueue = Promise.resolve();
  }

  async init() {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });

    try {
      await fs.access(this.filePath);
    } catch {
      await fs.writeFile(this.filePath, JSON.stringify({ reports: {} }, null, 2));
    }
  }

  async createReport(report) {
    const id = crypto.randomUUID();

    await this.updateDb((db) => {
      db.reports[id] = {
        ...report,
        createdAt: new Date().toISOString()
      };
      return db;
    });

    return id;
  }

  async getReport(id) {
    const db = await this.readDb();
    return db.reports[id] || null;
  }

  async updateDb(updater) {
    this.writeQueue = this.writeQueue.then(async () => {
      const db = await this.readDb();
      const next = updater(db);
      await fs.writeFile(this.filePath, JSON.stringify(next, null, 2));
    });

    return this.writeQueue;
  }

  async readDb() {
    await this.init();
    const raw = await fs.readFile(this.filePath, "utf8");
    const db = JSON.parse(raw || "{}");
    return {
      reports: db.reports || {}
    };
  }
}
