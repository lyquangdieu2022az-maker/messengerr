export class FacebookClient {
  constructor({ pageAccessToken, pageId, graphVersion }) {
    this.pageAccessToken = pageAccessToken;
    this.pageId = pageId;
    this.graphVersion = graphVersion || "v25.0";
    this.baseUrl = `https://graph.facebook.com/${this.graphVersion}`;
  }

  async sendText(psid, text) {
    for (const chunk of chunkText(text, 1900)) {
      await this.callSendApi({
        recipient: { id: psid },
        messaging_type: "RESPONSE",
        message: { text: chunk }
      });
    }
  }

  async sendAudio(psid, audioUrl) {
    await this.callSendApi({
      recipient: { id: psid },
      messaging_type: "RESPONSE",
      message: {
        attachment: {
          type: "audio",
          payload: {
            url: audioUrl,
            is_reusable: false
          }
        }
      }
    });
  }

  async sendAction(psid, senderAction) {
    await this.callSendApi({
      recipient: { id: psid },
      sender_action: senderAction
    });
  }

  async callSendApi(payload) {
    if (!this.pageAccessToken) {
      throw new Error("PAGE_ACCESS_TOKEN is missing.");
    }

    const node = this.pageId || "me";
    const url = `${this.baseUrl}/${node}/messages?access_token=${encodeURIComponent(this.pageAccessToken)}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Facebook Send API failed: ${response.status} ${errorBody}`);
    }

    return response.json();
  }
}

export function chunkText(text, maxLength) {
  if (text.length <= maxLength) return [text];

  const chunks = [];
  let remaining = text;

  while (remaining.length > maxLength) {
    let splitAt = remaining.lastIndexOf("\n", maxLength);
    if (splitAt < maxLength * 0.5) splitAt = remaining.lastIndexOf(". ", maxLength);
    if (splitAt < maxLength * 0.5) splitAt = maxLength;

    chunks.push(remaining.slice(0, splitAt).trim());
    remaining = remaining.slice(splitAt).trim();
  }

  if (remaining) chunks.push(remaining);
  return chunks;
}
