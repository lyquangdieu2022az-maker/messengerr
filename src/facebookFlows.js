const SUPPORT_LINKS = {
  help: "https://www.facebook.com/help/",
  hackedAccount: "https://www.facebook.com/hacked",
  hackedPage: "https://www.facebook.com/help/738660629556925/",
  impersonation: "https://www.facebook.com/help/174210519303259",
  securityCheckup: "https://www.facebook.com/help/securitycheckup",
  accountRecovery: "https://www.facebook.com/help/292105707596942/",
  lockedAccount: "https://www.facebook.com/help/669497174142663",
  scams: "https://www.facebook.com/help/1674717642789671/"
};

export function getFacebookFlowReply(normalizedText) {
  if (hasAny(normalizedText, ["gia mao", "mao danh", "fake acc", "fake account", "report gia", "bao cao gia mao"])) {
    return impersonationFlow();
  }

  if (hasAny(normalizedText, ["thiet bi la", "dang nhap la", "login la", "canh bao dang nhap", "bao mat", "2fa", "xac thuc 2 buoc"])) {
    return loginAlertFlow();
  }

  if (hasAny(normalizedText, ["bi hack", "mat tai khoan", "bi chiem", "doi mat khau", "khong vao duoc nick", "mat nick"])) {
    return hackedAccountFlow();
  }

  if (hasAny(normalizedText, ["mat page", "page bi hack", "fanpage bi hack", "bi mat quyen page", "mat quyen quan tri", "business bi hack"])) {
    return hackedPageFlow();
  }

  if (hasAny(normalizedText, ["bi khoa", "khoa tai khoan", "vo hieu hoa", "bi han che", "account locked", "disabled"])) {
    return lockedAccountFlow();
  }

  if (hasAny(normalizedText, ["lua dao", "scam", "phishing", "link la", "tin nhan gia meta", "ban quyen gia"])) {
    return scamFlow();
  }

  return null;
}

export function mainHelp(botName) {
  return [
    `Mình là ${botName}, trợ lý AI hỗ trợ sự cố Facebook/Meta.`,
    "",
    "Bạn có thể nhắn ngắn gọn vấn đề, ví dụ:",
    "- bị giả mạo tài khoản",
    "- có thiết bị lạ đăng nhập",
    "- tài khoản bị hack",
    "- mất quyền quản trị Page",
    "- tài khoản bị khóa hoặc vô hiệu hóa",
    "- nghi ngờ link/tin nhắn lừa đảo",
    "",
    "Lệnh nhanh:",
    "- nhớ rằng <thông tin>: lưu ghi nhớ cho lần sau",
    "- quên tôi: xóa ghi nhớ của bạn",
    "- bật giọng nói / tắt giọng nói: bật hoặc tắt audio trả lời",
    "",
    "Lưu ý: mình có thể hướng dẫn, soạn nội dung báo cáo, đưa link chính thức và checklist xử lý. Mình không thể đăng nhập tài khoản của bạn, không xin mật khẩu/mã 2FA/token, và không thể tự gửi báo cáo thay bạn nếu Meta không cung cấp API chính thức."
  ].join("\n");
}

function impersonationFlow() {
  return [
    "Mình xử lý theo luồng báo cáo giả mạo nhé.",
    "",
    "1. Bạn chuẩn bị:",
    "- Link tài khoản/Page giả mạo.",
    "- Link tài khoản/Page thật của bạn hoặc người bị giả mạo.",
    "- Ảnh chụp màn hình tên, ảnh đại diện, bài viết/tin nhắn giả mạo nếu có.",
    "- Mô tả ngắn: họ đang giả mạo ai, gây hại như thế nào.",
    "",
    "2. Cách báo cáo chính thức:",
    `- Mở hướng dẫn của Facebook: ${SUPPORT_LINKS.impersonation}`,
    "- Vào profile/Page giả mạo.",
    "- Chọn dấu ba chấm hoặc Tìm hỗ trợ/Báo cáo.",
    "- Chọn giả mạo người khác rồi làm theo hướng dẫn.",
    "",
    "3. Mẫu nội dung bạn có thể dán vào báo cáo:",
    "Tài khoản/Page này đang giả mạo tôi hoặc thương hiệu của tôi. Họ sử dụng tên, hình ảnh hoặc nội dung gây nhầm lẫn để liên hệ người khác. Vui lòng xem xét và gỡ tài khoản/Page giả mạo này.",
    "",
    "Gửi mình link tài khoản/Page giả mạo, mình sẽ giúp bạn viết bản báo cáo rõ hơn. Vì lý do bảo mật và chính sách Meta, bạn là người bấm gửi báo cáo trên trang chính thức."
  ].join("\n");
}

function loginAlertFlow() {
  return [
    "Nếu có thiết bị lạ đăng nhập, làm ngay theo thứ tự này:",
    "",
    "1. Đổi mật khẩu Facebook từ thiết bị bạn tin tưởng.",
    "2. Vào phần Nơi bạn đã đăng nhập và đăng xuất tất cả thiết bị lạ.",
    "3. Bật xác thực 2 yếu tố.",
    "4. Bật cảnh báo đăng nhập lạ.",
    "5. Kiểm tra email, số điện thoại, tài khoản liên kết và Business/Page xem có ai bị thêm lạ không.",
    "",
    `Công cụ chính thức: ${SUPPORT_LINKS.securityCheckup}`,
    `Nếu nghi bị hack: ${SUPPORT_LINKS.hackedAccount}`,
    "",
    "Mình không thể tự giám sát thiết bị đăng nhập của tài khoản cá nhân vì Facebook không mở API đó cho bot Page. Nhưng khi bạn nhận cảnh báo hoặc thấy thiết bị lạ, gửi nội dung cảnh báo cho mình, mình sẽ hướng dẫn bước tiếp theo."
  ].join("\n");
}

function hackedAccountFlow() {
  return [
    "Luồng xử lý tài khoản Facebook bị hack:",
    "",
    "1. Mở trên thiết bị bạn từng đăng nhập trước đây:",
    SUPPORT_LINKS.hackedAccount,
    "",
    "2. Chọn tài khoản của bạn và làm theo hướng dẫn khôi phục.",
    "3. Nếu email bị đổi, kiểm tra email cũ của bạn: Facebook thường gửi link đảo ngược thay đổi email.",
    "4. Sau khi vào lại được, đổi mật khẩu, bật 2FA, xóa thiết bị lạ, kiểm tra Page/Business/Ads.",
    "",
    "Không gửi cho ai mật khẩu, mã 2FA, cookie hoặc token. Nếu ai nhắn rằng có thể mở khóa nhanh và đòi tiền/mã đăng nhập, hãy coi là lừa đảo."
  ].join("\n");
}

function hackedPageFlow() {
  return [
    "Luồng xử lý Page/Fanpage bị mất quyền hoặc bị chiếm:",
    "",
    `1. Mở hướng dẫn khôi phục Page chính thức: ${SUPPORT_LINKS.hackedPage}`,
    "2. Đăng nhập bằng tài khoản từng quản lý Page.",
    "3. Chuẩn bị bằng chứng: link Page, vai trò quản trị trước đây, ảnh chụp email/thông báo thay đổi quyền, Business ID nếu có.",
    "4. Kiểm tra Meta Business Suite/Business Portfolio xem có người lạ, đối tác lạ, app lạ hoặc tài khoản quảng cáo lạ không.",
    "",
    "Gửi mình tình huống cụ thể: bạn còn vào được tài khoản cá nhân không, còn thấy Page trong Business không, ai bị mất quyền trước. Mình sẽ viết checklist khôi phục sát hơn."
  ].join("\n");
}

function lockedAccountFlow() {
  return [
    "Nếu tài khoản bị khóa, hạn chế hoặc vô hiệu hóa:",
    "",
    `1. Kiểm tra luồng khôi phục tài khoản: ${SUPPORT_LINKS.accountRecovery}`,
    `2. Nếu Facebook báo tài khoản bị khóa: ${SUPPORT_LINKS.lockedAccount}`,
    "3. Đăng nhập bằng thiết bị và mạng bạn từng dùng trước đây.",
    "4. Làm theo màn hình xác minh danh tính nếu Facebook yêu cầu.",
    "5. Không gửi giấy tờ tùy thân cho bot hoặc người lạ; chỉ gửi trong biểu mẫu chính thức của Facebook.",
    "",
    "Bạn gửi mình nguyên văn thông báo Facebook đang hiện, mình sẽ giải thích và chỉ bước tiếp theo."
  ].join("\n");
}

function scamFlow() {
  return [
    "Dấu hiệu lừa đảo/phishing trên Facebook:",
    "",
    "- Tin nhắn dọa khóa Page/tài khoản và ép bấm link lạ.",
    "- Link không thuộc facebook.com, meta.com hoặc business.facebook.com.",
    "- Yêu cầu mật khẩu, mã 2FA, cookie, token hoặc thanh toán để mở khóa.",
    "- Tự xưng Meta Support nhưng nhắn từ tài khoản cá nhân/Page lạ.",
    "",
    "Cách xử lý:",
    "1. Không bấm link, không tải file.",
    "2. Chụp màn hình lại bằng chứng.",
    "3. Báo cáo tài khoản/tin nhắn đó trong Facebook.",
    "4. Đổi mật khẩu và bật 2FA nếu đã lỡ bấm link.",
    `5. Đọc hướng dẫn chính thức: ${SUPPORT_LINKS.scams}`,
    "",
    "Bạn có thể gửi nội dung tin nhắn đáng ngờ, mình sẽ giúp phân tích có phải lừa đảo không."
  ].join("\n");
}

function hasAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}
