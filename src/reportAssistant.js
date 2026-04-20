const REPORT_TYPES = {
  impersonation: {
    title: "Báo cáo giả mạo",
    menuTitle: "Giả mạo",
    keywords: ["gia mao", "mao danh", "fake", "fake acc", "fake page", "tai khoan gia", "page gia"],
    officialLinks: [
      { title: "Hướng dẫn Meta", url: "https://www.facebook.com/help/174210519303259" }
    ],
    fields: [
      {
        key: "fakeLink",
        label: "Link giả mạo",
        prompt: "Gửi link tài khoản/Page đang giả mạo."
      },
      {
        key: "realLink",
        label: "Link thật",
        prompt: "Gửi link tài khoản/Page thật của Anh/Chị hoặc người bị giả mạo."
      },
      {
        key: "victim",
        label: "Người/thương hiệu bị giả mạo",
        prompt: "Họ đang giả mạo ai hoặc thương hiệu nào?"
      },
      {
        key: "harm",
        label: "Hành vi gây hại",
        prompt: "Họ đã làm gì gây nhầm lẫn hoặc gây hại? Ví dụ: nhắn tin lừa đảo, đăng bài giả, dùng ảnh/tên của Anh/Chị."
      }
    ]
  },
  hacked_account: {
    title: "Khôi phục tài khoản bị hack",
    menuTitle: "Bị hack",
    keywords: ["bi hack", "mat nick", "mat tai khoan", "bi chiem", "doi mat khau", "khong vao duoc nick"],
    officialLinks: [
      { title: "facebook.com/hacked", url: "https://www.facebook.com/hacked" },
      { title: "Security Checkup", url: "https://www.facebook.com/help/securitycheckup" }
    ],
    fields: [
      {
        key: "canLogin",
        label: "Còn đăng nhập được không",
        prompt: "Anh/Chị còn đăng nhập được Facebook ở thiết bị nào không?"
      },
      {
        key: "changedInfo",
        label: "Thông tin bị đổi",
        prompt: "Email, số điện thoại, mật khẩu hoặc tên tài khoản có bị đổi không?"
      },
      {
        key: "lastAccess",
        label: "Thời điểm mất quyền",
        prompt: "Anh/Chị bắt đầu mất quyền truy cập từ khi nào?"
      },
      {
        key: "evidence",
        label: "Bằng chứng/thông báo",
        prompt: "Facebook đang hiện thông báo gì? Nếu có ảnh chụp, Anh/Chị có thể gửi mô tả hoặc ảnh."
      }
    ]
  },
  locked_account: {
    title: "Kháng nghị tài khoản bị khóa",
    menuTitle: "Bị khóa",
    keywords: ["bi khoa", "dang bi khoa", "khoa tai khoan", "vo hieu hoa", "disabled", "checkpoint", "link 956", "duoi 956"],
    officialLinks: [
      { title: "Tài khoản bị khóa", url: "https://www.facebook.com/help/669497174142663" },
      { title: "Khôi phục tài khoản", url: "https://www.facebook.com/help/292105707596942/" }
    ],
    fields: [
      {
        key: "message",
        label: "Thông báo lỗi",
        prompt: "Gửi nguyên văn thông báo Facebook đang hiện khi tài khoản bị khóa/checkpoint."
      },
      {
        key: "accountLink",
        label: "Link tài khoản",
        prompt: "Nếu có link tài khoản của Anh/Chị, gửi vào đây. Nếu không có, bấm Bỏ qua."
      },
      {
        key: "canVerify",
        label: "Khả năng xác minh",
        prompt: "Facebook có cho xác minh email, số điện thoại, giấy tờ hoặc khuôn mặt không?"
      },
      {
        key: "context",
        label: "Bối cảnh trước khi bị khóa",
        prompt: "Trước khi bị khóa Anh/Chị có đăng nhập thiết bị lạ, đổi thông tin, chạy quảng cáo, đổi tên hoặc bị báo cáo gì không?"
      }
    ]
  },
  page_access: {
    title: "Khôi phục Page/Fanpage",
    menuTitle: "Mất Page",
    keywords: ["mat page", "mat fanpage", "page bi hack", "mat quyen page", "mat quyen quan tri", "admin page"],
    officialLinks: [
      { title: "Khôi phục Page", url: "https://www.facebook.com/help/738660629556925/" },
      { title: "Business Settings", url: "https://business.facebook.com/settings/" }
    ],
    fields: [
      {
        key: "pageLink",
        label: "Link Page",
        prompt: "Gửi link Page/Fanpage đang bị mất quyền hoặc bị chiếm."
      },
      {
        key: "oldRole",
        label: "Quyền trước đây",
        prompt: "Trước đây Anh/Chị có quyền gì trên Page? Ví dụ: admin, full control, editor, chủ Business."
      },
      {
        key: "whenLost",
        label: "Thời điểm mất quyền",
        prompt: "Anh/Chị mất quyền từ lúc nào? Có nhận email/thông báo thay đổi quyền không?"
      },
      {
        key: "evidence",
        label: "Bằng chứng sở hữu",
        prompt: "Anh/Chị có bằng chứng gì: email cũ, Business ID, ảnh thông báo, giấy tờ thương hiệu, lịch sử quản trị?"
      }
    ]
  },
  scam: {
    title: "Báo cáo lừa đảo/phishing",
    menuTitle: "Lừa đảo",
    keywords: ["lua dao", "scam", "phishing", "link la", "tin nhan gia meta", "ban quyen gia", "meta support gia"],
    officialLinks: [
      { title: "Lừa đảo Facebook", url: "https://www.facebook.com/help/1674717642789671/" },
      { title: "Security Checkup", url: "https://www.facebook.com/help/securitycheckup" }
    ],
    fields: [
      {
        key: "sender",
        label: "Nguồn lừa đảo",
        prompt: "Ai gửi nội dung đáng ngờ? Gửi link tài khoản/Page hoặc mô tả người gửi."
      },
      {
        key: "message",
        label: "Nội dung đáng ngờ",
        prompt: "Dán nội dung tin nhắn/link đáng ngờ. Đừng gửi mật khẩu, mã 2FA, token hoặc cookie."
      },
      {
        key: "actionTaken",
        label: "Anh/Chị đã làm gì",
        prompt: "Anh/Chị đã bấm link, đăng nhập, tải file hoặc gửi thông tin gì chưa?"
      },
      {
        key: "impact",
        label: "Thiệt hại/nguy cơ",
        prompt: "Có thiệt hại hoặc dấu hiệu bất thường nào chưa? Ví dụ: bị đổi mật khẩu, mất Page, bị trừ tiền quảng cáo."
      }
    ]
  },
  content: {
    title: "Báo cáo nội dung vi phạm",
    menuTitle: "Nội dung",
    keywords: ["bao cao bai viet", "bao cao noi dung", "vi pham", "quay roi", "de doa", "ban quyen", "copyright", "noi dung xau"],
    officialLinks: [
      { title: "Chính sách Meta", url: "https://transparency.meta.com/policies/community-standards/" },
      { title: "Trợ giúp Facebook", url: "https://www.facebook.com/help/" }
    ],
    fields: [
      {
        key: "contentLink",
        label: "Link nội dung",
        prompt: "Gửi link bài viết, bình luận, video, Page hoặc tài khoản cần báo cáo."
      },
      {
        key: "reason",
        label: "Lý do báo cáo",
        prompt: "Nội dung vi phạm gì? Ví dụ: giả mạo, lừa đảo, quấy rối, đe dọa, spam, bản quyền, nội dung nhạy cảm."
      },
      {
        key: "impact",
        label: "Ảnh hưởng",
        prompt: "Nội dung đó ảnh hưởng đến Anh/Chị/người khác như thế nào?"
      },
      {
        key: "evidence",
        label: "Bằng chứng",
        prompt: "Anh/Chị có ảnh chụp, thời gian xảy ra, tên người liên quan hoặc bằng chứng nào khác không?"
      }
    ]
  },
  ads_appeal: {
    title: "Kháng nghị quảng cáo/tài khoản quảng cáo",
    menuTitle: "Quảng cáo",
    keywords: ["quang cao", "ads", "tkqc", "tai khoan quang cao", "ads manager", "tu choi quang cao", "han che quang cao"],
    officialLinks: [
      { title: "Account Quality", url: "https://www.facebook.com/accountquality/" },
      { title: "Ads Manager", url: "https://www.facebook.com/adsmanager/" }
    ],
    fields: [
      {
        key: "asset",
        label: "Tài sản bị ảnh hưởng",
        prompt: "Quảng cáo, tài khoản quảng cáo, Page hay Business nào đang bị hạn chế/từ chối?"
      },
      {
        key: "reason",
        label: "Lý do Meta đưa ra",
        prompt: "Meta đang báo lý do gì? Dán nguyên văn nếu có."
      },
      {
        key: "changes",
        label: "Anh/Chị đã chỉnh sửa gì",
        prompt: "Anh/Chị đã sửa nội dung, landing page, thanh toán hoặc xác minh danh tính chưa?"
      },
      {
        key: "businessImpact",
        label: "Ảnh hưởng kinh doanh",
        prompt: "Việc này ảnh hưởng đến hoạt động kinh doanh/quảng cáo của Anh/Chị ra sao?"
      }
    ]
  }
};

const CANCEL_PAYLOAD = "REPORT_CANCEL";
const SKIP_PAYLOAD = "REPORT_SKIP";
const MENU_PAYLOAD = "REPORT_MENU";
const TYPE_PREFIX = "REPORT_TYPE:";

export function shouldStartReportAssistant(normalizedText) {
  return hasAny(normalizedText, [
    "bao cao",
    "report",
    "gui bao cao",
    "tao bao cao",
    "soan bao cao",
    "khieu nai",
    "khieu nau",
    "khang nghi",
    "to cao"
  ]);
}

export function isReportMenuPayload(text) {
  return text === MENU_PAYLOAD;
}

export function isReportCancel(text, normalizedText) {
  return text === CANCEL_PAYLOAD || ["huy", "huy bo", "thoat", "dung lai", "cancel"].includes(normalizedText);
}

export function getReportTypeFromPayload(text) {
  if (!text.startsWith(TYPE_PREFIX)) return null;
  const type = text.slice(TYPE_PREFIX.length);
  return REPORT_TYPES[type] ? type : null;
}

export function detectReportTypeFromText(normalizedText) {
  for (const [type, config] of Object.entries(REPORT_TYPES)) {
    if (hasAny(normalizedText, config.keywords)) return type;
  }

  return null;
}

export function createReportDraft(type) {
  const config = REPORT_TYPES[type];
  if (!config) return null;

  return {
    type,
    step: 0,
    answers: {},
    startedAt: new Date().toISOString()
  };
}

export function buildReportMenu() {
  return [
    "Em có thể tạo hồ sơ báo cáo/kháng nghị bán tự động cho Anh/Chị.",
    "",
    "Anh/Chị chọn loại vấn đề bên dưới. Em sẽ hỏi từng thông tin cần thiết, sau đó soạn sẵn nội dung để Anh/Chị dán vào form chính thức của Meta.",
    "",
    "Lưu ý: bot không tự bấm gửi thay Anh/Chị, vì Meta không mở API công khai cho việc đó. Anh/Chị là người bấm gửi trên trang chính thức."
  ].join("\n");
}

export function getReportMenuQuickReplies() {
  return [
    ...Object.entries(REPORT_TYPES).map(([type, config]) => ({
      title: config.menuTitle,
      payload: `${TYPE_PREFIX}${type}`
    })),
    { title: "Hủy", payload: CANCEL_PAYLOAD }
  ];
}

export function buildDraftStartReply(draft) {
  const config = REPORT_TYPES[draft.type];
  const field = config.fields[draft.step];

  return [
    `Ok, em sẽ tạo hồ sơ: ${config.title}.`,
    "",
    `Câu ${draft.step + 1}/${config.fields.length}: ${field.prompt}`
  ].join("\n");
}

export function buildDraftNextReply(draft) {
  const config = REPORT_TYPES[draft.type];
  const field = config.fields[draft.step];

  return `Câu ${draft.step + 1}/${config.fields.length}: ${field.prompt}`;
}

export function getDraftQuickReplies() {
  return [
    { title: "Bỏ qua", payload: SKIP_PAYLOAD },
    { title: "Hủy", payload: CANCEL_PAYLOAD }
  ];
}

export function advanceReportDraft(draft, rawText) {
  const config = REPORT_TYPES[draft.type];
  if (!config) return { draft, complete: true };

  const field = config.fields[draft.step];
  const value = rawText === SKIP_PAYLOAD ? "(bỏ qua)" : rawText.trim();
  const nextDraft = {
    ...draft,
    step: draft.step + 1,
    answers: {
      ...draft.answers,
      [field.key]: value || "(bỏ qua)"
    },
    updatedAt: new Date().toISOString()
  };

  return {
    draft: nextDraft,
    complete: nextDraft.step >= config.fields.length
  };
}

export function buildReportFinal(draft) {
  const config = REPORT_TYPES[draft.type];
  const details = config.fields
    .map((field) => `- ${field.label}: ${formatValue(draft.answers[field.key])}`)
    .join("\n");
  const reportBody = buildReportBody(draft);

  return {
    title: config.title,
    text: [
      `Em đã soạn xong hồ sơ: ${config.title}.`,
      "",
      "Thông tin đã thu thập:",
      details,
      "",
      "Nội dung đề xuất để Anh/Chị dán vào form chính thức:",
      "",
      reportBody,
      "",
      "Cách gửi:",
      "1. Bấm link chính thức em gửi bên dưới.",
      "2. Dán nội dung báo cáo/kháng nghị.",
      "3. Chỉ gửi giấy tờ hoặc thông tin nhạy cảm trực tiếp trên trang chính thức của Facebook/Meta, không gửi vào chat bot.",
      "",
      "Nếu Anh/Chị muốn em chỉnh giọng văn, nhắn: sửa báo cáo + phần Anh/Chị muốn đổi."
    ].join("\n"),
    buttonsText: "Mở link chính thức để gửi:",
    buttons: config.officialLinks.map((link) => ({
      type: "web_url",
      title: link.title.slice(0, 20),
      url: link.url
    }))
  };
}

export function buildReportCancelReply() {
  return "Em đã hủy hồ sơ báo cáo đang tạo. Khi cần làm lại, Anh/Chị nhắn: báo cáo.";
}

function buildReportBody(draft) {
  const answers = draft.answers;

  switch (draft.type) {
    case "impersonation":
      return [
        "Tôi muốn báo cáo một tài khoản/Page đang giả mạo.",
        `Link giả mạo: ${formatValue(answers.fakeLink)}`,
        `Link thật/người bị giả mạo: ${formatValue(answers.realLink)}`,
        `Người hoặc thương hiệu bị giả mạo: ${formatValue(answers.victim)}`,
        `Hành vi gây hại: ${formatValue(answers.harm)}`,
        "Tài khoản/Page này có thể gây nhầm lẫn cho người khác và ảnh hưởng đến danh tính hoặc thương hiệu của tôi. Kính mong Facebook/Meta xem xét và xử lý theo chính sách."
      ].join("\n");

    case "hacked_account":
      return [
        "Tôi cần hỗ trợ khôi phục tài khoản Facebook có dấu hiệu bị chiếm quyền.",
        `Tình trạng đăng nhập: ${formatValue(answers.canLogin)}`,
        `Thông tin có thể đã bị thay đổi: ${formatValue(answers.changedInfo)}`,
        `Thời điểm bắt đầu mất quyền: ${formatValue(answers.lastAccess)}`,
        `Bằng chứng hoặc thông báo đang thấy: ${formatValue(answers.evidence)}`,
        "Tôi mong Facebook/Meta hỗ trợ xác minh chủ sở hữu hợp pháp và khôi phục quyền truy cập cho tài khoản."
      ].join("\n");

    case "locked_account":
      return [
        "Tôi muốn yêu cầu xem xét lại tình trạng tài khoản Facebook bị khóa/checkpoint/hạn chế.",
        `Thông báo lỗi: ${formatValue(answers.message)}`,
        `Link tài khoản: ${formatValue(answers.accountLink)}`,
        `Phương thức xác minh đang thấy: ${formatValue(answers.canVerify)}`,
        `Bối cảnh trước khi bị khóa: ${formatValue(answers.context)}`,
        "Tôi cam kết cung cấp thông tin chính xác và mong Facebook/Meta xem xét lại nếu tài khoản bị khóa nhầm."
      ].join("\n");

    case "page_access":
      return [
        "Tôi cần hỗ trợ khôi phục quyền quản lý Page/Fanpage.",
        `Link Page: ${formatValue(answers.pageLink)}`,
        `Quyền quản trị trước đây: ${formatValue(answers.oldRole)}`,
        `Thời điểm mất quyền: ${formatValue(answers.whenLost)}`,
        `Bằng chứng sở hữu/quản trị: ${formatValue(answers.evidence)}`,
        "Tôi mong Facebook/Meta hỗ trợ kiểm tra lịch sử quyền quản trị và khôi phục quyền cho chủ sở hữu hợp pháp."
      ].join("\n");

    case "scam":
      return [
        "Tôi muốn báo cáo một hành vi lừa đảo/phishing trên Facebook.",
        `Nguồn gửi hoặc tài khoản/Page liên quan: ${formatValue(answers.sender)}`,
        `Nội dung/link đáng ngờ: ${formatValue(answers.message)}`,
        `Tôi đã thực hiện: ${formatValue(answers.actionTaken)}`,
        `Thiệt hại hoặc nguy cơ: ${formatValue(answers.impact)}`,
        "Nội dung này có dấu hiệu lừa đảo, đánh cắp thông tin hoặc giả mạo Meta/Facebook. Kính mong Facebook/Meta xem xét và xử lý."
      ].join("\n");

    case "content":
      return [
        "Tôi muốn báo cáo một nội dung có dấu hiệu vi phạm chính sách Facebook/Meta.",
        `Link nội dung: ${formatValue(answers.contentLink)}`,
        `Lý do báo cáo: ${formatValue(answers.reason)}`,
        `Ảnh hưởng: ${formatValue(answers.impact)}`,
        `Bằng chứng bổ sung: ${formatValue(answers.evidence)}`,
        "Kính mong Facebook/Meta xem xét nội dung này theo Tiêu chuẩn cộng đồng và chính sách liên quan."
      ].join("\n");

    case "ads_appeal":
      return [
        "Tôi muốn yêu cầu xem xét lại vấn đề quảng cáo/tài khoản quảng cáo.",
        `Tài sản bị ảnh hưởng: ${formatValue(answers.asset)}`,
        `Lý do Meta đưa ra: ${formatValue(answers.reason)}`,
        `Những điều đã chỉnh sửa/kiểm tra: ${formatValue(answers.changes)}`,
        `Ảnh hưởng kinh doanh: ${formatValue(answers.businessImpact)}`,
        "Tôi tin rằng nội dung/tài khoản có thể đã bị đánh giá nhầm hoặc cần được xem xét lại sau khi đã điều chỉnh. Kính mong Meta kiểm tra lại."
      ].join("\n");

    default:
      return "Tôi muốn gửi báo cáo/kháng nghị và nhờ Facebook/Meta xem xét theo thông tin đã cung cấp.";
  }
}

function formatValue(value) {
  return value || "(chưa cung cấp)";
}

function hasAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}
