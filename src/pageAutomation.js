const EMPTY_AI_MEMORY = {
  facts: [],
  summary: "",
  history: [],
  lastSupportTopic: "",
  reportDraft: null,
  voiceReplies: null
};

const DEFAULT_POST_TIMES = "08:00,12:00,16:00";
const DEFAULT_UTC_OFFSET_MINUTES = 420;
const DEFAULT_CATCH_UP_MINUTES = 90;
const DEFAULT_CHECK_INTERVAL_MS = 5 * 60 * 1000;
const MAX_POST_LENGTH = 1800;
const MAX_COMMENT_REPLY_LENGTH = 650;

const FACEBOOK_TOPICS = [
  {
    title: "Bảo mật tài khoản Facebook",
    angle: "đổi mật khẩu mạnh, bật xác thực 2 yếu tố và kiểm tra thiết bị đăng nhập"
  },
  {
    title: "Nhận biết tin nhắn giả mạo Meta",
    angle: "dấu hiệu link lạ, đòi mã đăng nhập, đe dọa khóa Page hoặc yêu cầu chuyển tiền"
  },
  {
    title: "Giữ quyền quản trị Page an toàn",
    angle: "phân quyền đúng vai trò, kiểm tra người có quyền truy cập và tránh thêm tài khoản lạ"
  },
  {
    title: "Khi tài khoản bị checkpoint hoặc bị khóa",
    angle: "chuẩn bị thông tin, đi theo kênh chính thức và không mua dịch vụ mở khóa không rõ nguồn"
  },
  {
    title: "Chất lượng Page và nội dung",
    angle: "đăng nội dung gốc, tránh spam, tránh gây hiểu nhầm và theo dõi cảnh báo trong Account Quality"
  },
  {
    title: "Messenger và chăm sóc khách hàng",
    angle: "trả lời rõ ràng, không xin thông tin nhạy cảm ở bình luận công khai và chuyển qua inbox khi cần"
  },
  {
    title: "Quảng cáo Facebook cơ bản",
    angle: "kiểm tra chính sách trước khi chạy, minh bạch nội dung và xử lý khi quảng cáo bị từ chối"
  },
  {
    title: "Quyền riêng tư cá nhân",
    angle: "kiểm tra ai có thể xem bài viết, thông tin liên hệ và hoạt động đăng nhập"
  },
  {
    title: "Báo cáo giả mạo hoặc lừa đảo",
    angle: "thu thập link, ảnh chụp màn hình, mô tả sự cố và gửi qua form chính thức"
  },
  {
    title: "Bản quyền và nguồn nội dung",
    angle: "tự viết nội dung, dùng hình/nhạc có quyền sử dụng và ghi nguồn tham khảo rõ ràng"
  },
  {
    title: "Xác minh doanh nghiệp Meta",
    angle: "chuẩn bị giấy tờ hợp lệ, thông tin doanh nghiệp nhất quán và theo dõi Business Support Home"
  },
  {
    title: "An toàn khi nhận file/link từ người lạ",
    angle: "không tải file đáng ngờ, không nhập mật khẩu ở trang lạ và kiểm tra tên miền trước khi đăng nhập"
  }
];

export function startPageAutomation({ ai, facebook, store, config }) {
  if (!config.autoPostEnabled) {
    console.log("Auto Page posting is disabled.");
    return null;
  }

  if (!config.pageAccessToken || !config.pageId) {
    console.warn("Auto Page posting skipped because PAGE_ACCESS_TOKEN or PAGE_ID is missing.");
    return null;
  }

  const timer = setInterval(() => {
    runDueAutoPosts({ ai, facebook, store, config }).catch((error) => {
      console.error("Auto Page posting failed:", error);
    });
  }, config.autoPostCheckIntervalMs);

  timer.unref?.();

  setTimeout(() => {
    runDueAutoPosts({ ai, facebook, store, config }).catch((error) => {
      console.error("Initial auto Page posting check failed:", error);
    });
  }, 30 * 1000).unref?.();

  console.log(`Auto Page posting enabled at: ${config.autoPostTimes.join(", ")}`);
  return timer;
}

export async function runDueAutoPosts({ ai, facebook, store, config, now = new Date() }) {
  const dueSlot = getDueAutoPostSlot({
    now,
    times: config.autoPostTimes,
    utcOffsetMinutes: config.autoPostUtcOffsetMinutes,
    catchUpMinutes: config.autoPostCatchUpMinutes
  });

  if (!dueSlot) return null;

  const slotKey = `${dueSlot.dayKey}:${dueSlot.time}`;
  if (await store.hasAutoPost(slotKey)) return null;

  const topic = pickTopic(dueSlot.dayKey, dueSlot.index);
  const message = await generateAutoPostText({ ai, topic, slot: dueSlot, config });
  const result = await facebook.publishPagePost(message);

  await store.saveAutoPost(slotKey, {
    postId: result.id || null,
    topic: topic.title,
    message,
    postedAt: new Date().toISOString()
  });

  console.log(`Auto Page post published for ${slotKey}: ${result.id || "(no id)"}`);
  return result;
}

export async function handlePageFeedChange({ change, ai, facebook, store, config }) {
  if (!config.commentAutoReplyEnabled) return false;
  if (change.field !== "feed") return false;

  const value = change.value || {};
  if (value.item !== "comment" || value.verb !== "add") return false;

  const commentId = value.comment_id || value.commentId;
  const postId = value.post_id || value.postId;
  const fromId = value.from?.id || value.sender_id || value.senderId;
  const message = String(value.message || value.text || "").trim();

  if (!commentId || !message) return false;
  if (config.pageId && fromId === config.pageId) return false;
  if (await store.hasRepliedComment(commentId)) return true;

  await store.saveRepliedComment(commentId, {
    status: "processing",
    postId,
    commentText: message,
    repliedAt: new Date().toISOString()
  });

  try {
    const reply = await generateCommentReply({ ai, message, config });
    const result = await facebook.replyToComment(commentId, reply);

    await store.saveRepliedComment(commentId, {
      status: "replied",
      postId,
      commentText: message,
      reply,
      facebookResult: result,
      repliedAt: new Date().toISOString()
    });

    console.log(`Auto replied to comment ${commentId}.`);
    return true;
  } catch (error) {
    await store.saveRepliedComment(commentId, {
      status: "failed",
      postId,
      commentText: message,
      error: error.message,
      repliedAt: new Date().toISOString()
    });
    throw error;
  }
}

export function buildPageAutomationConfig(env) {
  return {
    pageAccessToken: env.PAGE_ACCESS_TOKEN,
    pageId: env.PAGE_ID,
    autoPostEnabled: env.AUTO_POST_ENABLED === "true",
    autoPostTimes: parseTimes(env.AUTO_POST_TIMES || DEFAULT_POST_TIMES),
    autoPostUtcOffsetMinutes: Number(env.AUTO_POST_UTC_OFFSET_MINUTES || DEFAULT_UTC_OFFSET_MINUTES),
    autoPostCatchUpMinutes: Number(env.AUTO_POST_CATCH_UP_MINUTES || DEFAULT_CATCH_UP_MINUTES),
    autoPostCheckIntervalMs: Number(env.AUTO_POST_CHECK_INTERVAL_MS || DEFAULT_CHECK_INTERVAL_MS),
    autoPostSignature: env.AUTO_POST_SIGNATURE || "Nguồn tham khảo: Trung tâm trợ giúp Facebook/Meta. Nội dung do Page tự biên soạn, không đại diện Meta.",
    commentAutoReplyEnabled: env.COMMENT_AUTO_REPLY_ENABLED === "true"
  };
}

async function generateAutoPostText({ ai, topic, slot, config }) {
  const prompt = [
    "Viết 1 bài đăng Facebook bằng tiếng Việt có dấu cho Page hỗ trợ Facebook/Meta.",
    "",
    `Chủ đề: ${topic.title}.`,
    `Góc triển khai: ${topic.angle}.`,
    `Khung giờ đăng: ${slot.time}, ngày ${slot.dayKey}.`,
    "",
    "Yêu cầu bắt buộc:",
    "- Nội dung hoàn toàn tự viết, không sao chép từ bài người khác.",
    "- Không dùng lời hứa chắc chắn như mở khóa 100%, lấy lại nick chắc chắn, vượt chính sách hoặc né review.",
    "- Không mạo danh Meta/Facebook chính thức.",
    "- Không hướng dẫn hack, spam, lách chính sách, chiếm quyền tài khoản/Page.",
    "- Không yêu cầu người đọc gửi mật khẩu, mã 2FA, token, cookie hoặc giấy tờ nhạy cảm trong bình luận.",
    "- Gợi ý thực tế, dễ hiểu, giọng thân thiện, xưng em và gọi người đọc là Anh/Chị.",
    "- Có 3 đến 5 gạch đầu dòng hoặc bước ngắn.",
    "- Cuối bài thêm đúng dòng ghi chú này:",
    config.autoPostSignature,
    "",
    "Độ dài khoảng 700 đến 1200 ký tự. Không dùng markdown code block."
  ].join("\n");

  try {
    const answer = await withTimeout(
      ai.answer({ text: prompt, memory: EMPTY_AI_MEMORY }),
      45000,
      "Auto post AI generation timed out"
    );
    return cleanGeneratedText(answer, MAX_POST_LENGTH) || buildFallbackPost(topic, config.autoPostSignature);
  } catch (error) {
    console.error("Auto post AI generation failed:", error);
    return buildFallbackPost(topic, config.autoPostSignature);
  }
}

async function generateCommentReply({ ai, message }) {
  const prompt = [
    "Viết 1 phản hồi công khai dưới bình luận Facebook bằng tiếng Việt có dấu.",
    "",
    `Bình luận của người dùng: ${message}`,
    "",
    "Yêu cầu:",
    "- Trả lời ngắn, lịch sự, tự nhiên, tối đa 650 ký tự.",
    "- Xưng em, gọi người đọc là Anh/Chị.",
    "- Nếu là câu hỏi về Facebook/Meta, hướng dẫn bước tiếp theo rõ ràng.",
    "- Nếu cần thông tin riêng tư, chỉ mời Anh/Chị nhắn inbox; không yêu cầu mật khẩu, mã 2FA, token, cookie hoặc giấy tờ trong bình luận.",
    "- Không hứa xử lý chắc chắn thay Meta/Facebook.",
    "- Không tranh cãi nếu bình luận tiêu cực; giữ giọng bình tĩnh.",
    "- Không dùng markdown code block."
  ].join("\n");

  try {
    const answer = await withTimeout(
      ai.answer({ text: prompt, memory: EMPTY_AI_MEMORY }),
      30000,
      "Comment reply AI generation timed out"
    );
    return cleanGeneratedText(answer, MAX_COMMENT_REPLY_LENGTH) || buildFallbackCommentReply();
  } catch (error) {
    console.error("Comment reply AI generation failed:", error);
    return buildFallbackCommentReply();
  }
}

function buildFallbackPost(topic, signature) {
  return [
    `${topic.title}`,
    "",
    `Anh/Chị nên lưu ý: ${topic.angle}.`,
    "",
    "Một vài bước an toàn:",
    "1. Chỉ thao tác trên trang chính thức của Facebook/Meta.",
    "2. Không gửi mật khẩu, mã 2FA, token hoặc cookie cho bất kỳ ai.",
    "3. Chuẩn bị ảnh chụp màn hình và link liên quan nếu cần báo cáo sự cố.",
    "4. Nếu vấn đề liên quan bảo mật, hãy đổi mật khẩu và kiểm tra thiết bị đăng nhập ngay.",
    "",
    signature
  ].join("\n");
}

function buildFallbackCommentReply() {
  return "Em đã nhận bình luận của Anh/Chị. Nếu đây là vấn đề Facebook/Meta, Anh/Chị mô tả thêm lỗi đang gặp hoặc nhắn inbox để em hướng dẫn kỹ hơn. Anh/Chị không gửi mật khẩu, mã 2FA, token hoặc giấy tờ nhạy cảm trong bình luận nhé.";
}

function getDueAutoPostSlot({ now, times, utcOffsetMinutes, catchUpMinutes }) {
  const local = getOffsetDate(now, utcOffsetMinutes);
  const dayKey = formatOffsetDate(local);
  const currentMinutes = local.getUTCHours() * 60 + local.getUTCMinutes();

  for (let index = 0; index < times.length; index += 1) {
    const time = times[index];
    const slotMinutes = timeToMinutes(time);
    const minutesLate = currentMinutes - slotMinutes;

    if (minutesLate >= 0 && minutesLate <= catchUpMinutes) {
      return { dayKey, time, index };
    }
  }

  return null;
}

function pickTopic(dayKey, slotIndex) {
  const seed = Number(dayKey.replace(/-/g, "")) || 0;
  return FACEBOOK_TOPICS[(seed * 3 + slotIndex) % FACEBOOK_TOPICS.length];
}

function parseTimes(value) {
  const times = String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter((item) => /^\d{2}:\d{2}$/.test(item))
    .filter((item, index, all) => all.indexOf(item) === index)
    .sort((a, b) => timeToMinutes(a) - timeToMinutes(b));

  return times.length ? times : parseTimes(DEFAULT_POST_TIMES);
}

function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function getOffsetDate(date, offsetMinutes) {
  return new Date(date.getTime() + offsetMinutes * 60 * 1000);
}

function formatOffsetDate(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function cleanGeneratedText(value, maxLength) {
  const text = String(value || "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^["']|["']$/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3).trim()}...`;
}

function withTimeout(promise, timeoutMs, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), timeoutMs);
    })
  ]);
}
