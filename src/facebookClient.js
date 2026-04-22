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

  async sendQuickReplies(psid, text, quickReplies) {
    const chunks = chunkText(text, 1900);
    const lastChunk = chunks.pop();

    for (const chunk of chunks) {
      await this.sendText(psid, chunk);
    }

    await this.callSendApi({
      recipient: { id: psid },
      messaging_type: "RESPONSE",
      message: {
        text: lastChunk,
        quick_replies: quickReplies.slice(0, 13).map((reply) => ({
          content_type: "text",
          title: reply.title.slice(0, 20),
          payload: reply.payload
        }))
      }
    });
  }

  async sendButtons(psid, text, buttons) {
    await this.callSendApi({
      recipient: { id: psid },
      messaging_type: "RESPONSE",
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "button",
            text: text.slice(0, 640),
            buttons: buttons.slice(0, 3).map((button) => {
              if (button.type === "web_url") {
                return {
                  type: "web_url",
                  url: button.url,
                  title: button.title.slice(0, 20)
                };
              }

              return {
                type: "postback",
                title: button.title.slice(0, 20),
                payload: button.payload
              };
            })
          }
        }
      }
    });
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

  async publishPagePost(message) {
    if (!this.pageAccessToken) {
      throw new Error("PAGE_ACCESS_TOKEN is missing.");
    }

    if (!this.pageId) {
      throw new Error("PAGE_ID is required for automatic Page posting.");
    }

    const response = await fetch(`${this.baseUrl}/${encodeURIComponent(this.pageId)}/feed`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        access_token: this.pageAccessToken,
        message
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Facebook Page post failed: ${response.status} ${errorBody}`);
    }

    return response.json();
  }

  async replyToComment(commentId, message) {
    if (!this.pageAccessToken) {
      throw new Error("PAGE_ACCESS_TOKEN is missing.");
    }

    const response = await fetch(`${this.baseUrl}/${encodeURIComponent(commentId)}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        access_token: this.pageAccessToken,
        message
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Facebook comment reply failed: ${response.status} ${errorBody}`);
    }

    return response.json();
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
