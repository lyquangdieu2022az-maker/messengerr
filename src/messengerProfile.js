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
    persistent_menu: buildPersistentMenu()
  };
}

export function buildGreeting({ botName }) {
  return {
    greeting: [
      {
        locale: "default",
        text: `Xin chào, em là ${botName}. Em có thể hỗ trợ Facebook/Meta, tạo báo cáo/kháng nghị và trò chuyện AI.`
      }
    ]
  };
}

function buildPersistentMenu() {
  return [
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
  ];
}

export async function setupMessengerProfile({ pageAccessToken, graphVersion, botName, setupGreeting = false }) {
  if (!pageAccessToken) {
    throw new Error("PAGE_ACCESS_TOKEN is missing.");
  }

  const baseUrl = `https://graph.facebook.com/${graphVersion || "v25.0"}`;
  const profileResult = await postMessengerProfile({
    baseUrl,
    pageAccessToken,
    body: buildMessengerProfile({ botName })
  });

  let greetingResult = null;
  if (setupGreeting) {
    try {
      greetingResult = await postMessengerProfile({
        baseUrl,
        pageAccessToken,
        body: buildGreeting({ botName })
      });
    } catch (error) {
      console.warn("Messenger greeting setup skipped:", error.message);
    }
  }

  return {
    profile: profileResult,
    greeting: greetingResult
  };
}

async function postMessengerProfile({ baseUrl, pageAccessToken, body }) {
  const response = await fetch(`${baseUrl}/me/messenger_profile?access_token=${encodeURIComponent(pageAccessToken)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Messenger Profile API failed: ${response.status} ${errorBody}`);
  }

  return response.json();
}
