export const MENU_PAYLOADS = {
  getStarted: "MENU_HELP",
  help: "MENU_HELP",
  askAi: "MENU_ASK_AI",
  report: "REPORT_MENU",
  lockedAccount: "MENU_LOCKED_ACCOUNT",
  hackedAccount: "MENU_HACKED_ACCOUNT",
  pageAccess: "MENU_PAGE_ACCESS",
  loginAlert: "MENU_LOGIN_ALERT",
  scam: "MENU_SCAM"
};

export function buildMessengerProfile({ botName }) {
  return {
    get_started: {
      payload: MENU_PAYLOADS.getStarted
    },
    greeting: [
      {
        locale: "default",
        text: `Xin chào, em là ${botName}. Em có thể hỗ trợ Facebook/Meta, tạo báo cáo/kháng nghị và trò chuyện AI.`
      }
    ],
    persistent_menu: [
      {
        locale: "default",
        composer_input_disabled: false,
        call_to_actions: [
          {
            type: "postback",
            title: "Hỏi AI",
            payload: MENU_PAYLOADS.askAi
          },
          {
            type: "nested",
            title: "Hỗ trợ Facebook",
            call_to_actions: [
              {
                type: "postback",
                title: "Tài khoản bị khóa",
                payload: MENU_PAYLOADS.lockedAccount
              },
              {
                type: "postback",
                title: "Tài khoản bị hack",
                payload: MENU_PAYLOADS.hackedAccount
              },
              {
                type: "postback",
                title: "Mất quyền Page",
                payload: MENU_PAYLOADS.pageAccess
              },
              {
                type: "postback",
                title: "Thiết bị lạ",
                payload: MENU_PAYLOADS.loginAlert
              },
              {
                type: "postback",
                title: "Lừa đảo/phishing",
                payload: MENU_PAYLOADS.scam
              }
            ]
          },
          {
            type: "nested",
            title: "Công cụ",
            call_to_actions: [
              {
                type: "postback",
                title: "Tạo báo cáo",
                payload: MENU_PAYLOADS.report
              },
              {
                type: "postback",
                title: "Trợ giúp",
                payload: MENU_PAYLOADS.help
              }
            ]
          }
        ]
      }
    ]
  };
}

export async function setupMessengerProfile({ pageAccessToken, graphVersion, botName }) {
  if (!pageAccessToken) {
    throw new Error("PAGE_ACCESS_TOKEN is missing.");
  }

  const profile = buildMessengerProfile({ botName });
  const baseUrl = `https://graph.facebook.com/${graphVersion || "v25.0"}`;
  const response = await fetch(`${baseUrl}/me/messenger_profile?access_token=${encodeURIComponent(pageAccessToken)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Messenger Profile API failed: ${response.status} ${errorBody}`);
  }

  return response.json();
}
