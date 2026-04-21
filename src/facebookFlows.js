const SUPPORT_LINKS = {
  help: "https://www.facebook.com/help/",
  policies: "https://transparency.meta.com/policies/community-standards/",
  accountQuality: "https://www.facebook.com/accountquality/",
  businessHelp: "https://www.facebook.com/business/help/",
  businessSupportHome: "https://business.facebook.com/business-support-home/",
  businessSettings: "https://business.facebook.com/settings/",
  adsManager: "https://www.facebook.com/adsmanager/",
  adsLibrary: "https://www.facebook.com/ads/library/",
  hackedAccount: "https://www.facebook.com/hacked",
  hackedPage: "https://www.facebook.com/help/738660629556925/",
  impersonation: "https://www.facebook.com/help/174210519303259",
  securityCheckup: "https://www.facebook.com/help/securitycheckup",
  loginIdentify: "https://www.facebook.com/login/identify",
  twoFactor: "https://www.facebook.com/help/148233965247823",
  accountRecovery: "https://www.facebook.com/help/292105707596942/",
  lockedAccount: "https://www.facebook.com/help/669497174142663",
  supportInbox: "https://www.facebook.com/support/",
  accountStatus: "https://www.facebook.com/account_status",
  reportProblem: "https://www.facebook.com/help/186570224871049",
  scams: "https://www.facebook.com/help/1674717642789671/",
  messengerIssue: "https://www.facebook.com/help/1723537124537415",
  businessVerificationDocs: "https://www.facebook.com/help/243868559497297/",
  privacyCenter: "https://www.facebook.com/privacy/center/",
  privacyCheckup: "https://www.facebook.com/privacy/checkup/",
  copyright: "https://www.facebook.com/help/105418836216238/r.php/",
  copyrightForm: "https://www.facebook.com/help/contact/634636770043106",
  trademark: "https://www.facebook.com/help/507663689427413",
  brandRightsProtection: "https://www.facebook.com/business/tools/brand-rights-protection",
  commerceManager: "https://business.facebook.com/commerce/",
  professionalDashboard: "https://www.facebook.com/professional_dashboard",
  creatorsMonetization: "https://www.facebook.com/creators/tools/money",
  metaAi: "https://www.meta.ai/",
  llama: "https://www.llama.com/",
  metaDevelopers: "https://developers.facebook.com/"
};

export function getFacebookFlowReply(normalizedText) {
  if (hasAny(normalizedText, ["link ho tro", "duong link ho tro", "tong hop link", "link facebook", "link meta", "trung tam ho tro", "link chinh thuc"])) {
    return supportLinksFlow();
  }

  if (hasAny(normalizedText, ["ban lam duoc gi", "danh sach tac vu", "menu", "tac vu", "chuc nang"])) {
    return taskMenu();
  }

  if (hasAny(normalizedText, ["meta ai", "llama", "groq", "openrouter", "doi ai", "nha cung cap ai", "ai provider", "api meta", "meta api"])) {
    return metaAiFlow();
  }

  if (hasAny(normalizedText, ["gia mao", "mao danh", "fake acc", "fake account", "report gia", "bao cao gia mao"])) {
    return impersonationFlow();
  }

  if (hasAny(normalizedText, ["khong nhan ma", "mat 2fa", "mat ma 2fa", "ma dang nhap", "ma xac minh", "code dang nhap", "login code"])) {
    return twoFactorFlow();
  }

  if (hasAny(normalizedText, ["thiet bi la", "dang nhap la", "login la", "canh bao dang nhap", "bao mat", "xac thuc 2 buoc"])) {
    return loginAlertFlow();
  }

  if (hasAny(normalizedText, ["bi hack", "mat tai khoan", "bi chiem", "doi mat khau", "khong vao duoc nick", "mat nick"])) {
    return hackedAccountFlow();
  }

  if (hasAny(normalizedText, ["mat page", "page bi hack", "fanpage bi hack", "bi mat quyen page", "mat quyen quan tri", "business bi hack"])) {
    return hackedPageFlow();
  }

  if (hasAny(normalizedText, ["bi khoa", "dang bi khoa", "dang khoa", "tai khoan bi khoa", "nick bi khoa", "khoa tai khoan", "khoa xac minh", "mo khoa nick", "link 956", "duoi 956", "vo hieu hoa", "account locked", "disabled", "checkpoint"])) {
    return lockedAccountFlow();
  }

  if (hasAny(normalizedText, ["page bi han che", "chat luong page", "page quality", "vi pham page", "bai viet bi go", "tieu chuan cong dong", "bi canh bao page"])) {
    return pageQualityFlow();
  }

  if (hasAny(normalizedText, ["quang cao", "ads", "tkqc", "tai khoan quang cao", "ads manager", "quang cao bi tu choi", "bi han che quang cao", "thanh toan quang cao"])) {
    return adsFlow();
  }

  if (hasAny(normalizedText, ["xac minh doanh nghiep", "business verification", "business suite", "business manager", "business portfolio", "bm", "meta business", "verify business"])) {
    return businessVerificationFlow();
  }

  if (hasAny(normalizedText, ["messenger", "inbox", "page inbox", "khong nhan tin", "khong gui duoc tin", "tin nhan khong gui", "khong thay tin nhan", "loi chat"])) {
    return messengerFlow();
  }

  if (hasAny(normalizedText, ["them quan tri", "xoa quan tri", "quyen quan tri", "admin page", "phan quyen", "nguoi truy cap", "page access", "doi admin"])) {
    return adminAccessFlow();
  }

  if (hasAny(normalizedText, ["doi ten page", "doi ten fanpage", "ten page", "username page", "url page", "ten nguoi dung page"])) {
    return pageNameFlow();
  }

  if (hasAny(normalizedText, ["bao cao bai viet", "bao cao noi dung", "quay roi", "xuc pham", "de doa", "ban quyen", "copyright", "noi dung vi pham"])) {
    return contentReportFlow();
  }

  if (hasAny(normalizedText, ["lua dao", "scam", "phishing", "link la", "tin nhan gia meta", "ban quyen gia"])) {
    return scamFlow();
  }

  if (hasAny(normalizedText, ["kiem tien", "monetization", "reels", "stars", "bonus", "in-stream", "ad breaks", "professional mode"])) {
    return monetizationFlow();
  }

  return null;
}

export function mainHelp(botName) {
  return [
    `Em là ${botName}, trợ lý AI hỗ trợ sự cố Facebook/Meta.`,
    "",
    "Anh/Chị có thể nhắn trực tiếp vấn đề, ví dụ:",
    "- bị giả mạo tài khoản",
    "- có thiết bị lạ đăng nhập",
    "- không nhận mã 2FA",
    "- tài khoản bị hack",
    "- mất quyền quản trị Page",
    "- Page bị hạn chế hoặc vi phạm",
    "- quảng cáo bị từ chối",
    "- xác minh doanh nghiệp",
    "- Messenger/Page Inbox không nhận tin",
    "- đổi tên Page",
    "- báo cáo bài viết vi phạm",
    "- nghi ngờ link/tin nhắn lừa đảo",
    "- link hỗ trợ chính thức của Facebook/Meta",
    "- Meta AI/Llama dùng được không",
    "",
    "Lệnh nhanh:",
    "- danh sách tác vụ: xem toàn bộ nhóm hỗ trợ",
    "- link hỗ trợ: xem danh sách link chính thức theo nhóm",
    "- Meta AI: xem cách dùng Llama/Groq/OpenRouter hợp lệ cho bot",
    "- báo cáo: tạo hồ sơ báo cáo/kháng nghị bán tự động",
    "- nhớ rằng <thông tin>: lưu ghi nhớ cho lần sau",
    "- quên tôi: xóa ghi nhớ của Anh/Chị",
    "- bật giọng nói / tắt giọng nói: bật hoặc tắt audio trả lời",
    "",
    "Lưu ý: em có thể hướng dẫn, soạn nội dung báo cáo, đưa link chính thức và checklist xử lý. Em không thể đăng nhập tài khoản của Anh/Chị, không xin mật khẩu/mã 2FA/token, và không thể tự gửi báo cáo thay Anh/Chị nếu Meta không cung cấp API chính thức."
  ].join("\n");
}

function taskMenu() {
  return [
    "Các nhóm tác vụ Facebook em có thể hỗ trợ:",
    "",
    "1. Bảo mật tài khoản: thiết bị lạ, đổi mật khẩu, 2FA, mã đăng nhập, tài khoản bị hack.",
    "2. Page/Fanpage: mất quyền admin, Page bị hack, đổi tên Page, Page bị hạn chế, chất lượng Page.",
    "3. Messenger/Page Inbox: không nhận tin, không gửi được tin, lỗi webhook/bot, quyền nhắn tin.",
    "4. Báo cáo và vi phạm: giả mạo, lừa đảo, phishing, bài viết vi phạm, quấy rối, bản quyền.",
    "5. Quảng cáo: quảng cáo bị từ chối, tài khoản quảng cáo bị hạn chế, lỗi thanh toán, Account Quality.",
    "6. Meta Business: Business Suite, Business Manager, Business Portfolio, xác minh doanh nghiệp, phân quyền.",
    "7. Kiếm tiền: Stars, Reels, monetization, nội dung không đủ điều kiện.",
    "8. Soạn nội dung: báo cáo, kháng nghị, mô tả lỗi, tin nhắn trả khách, FAQ Page.",
    "9. Link chính thức: Help Center, Business Support, Account Quality, bản quyền, trademark, quyền riêng tư.",
    "10. AI provider: Gemini miễn phí, Llama/Groq/OpenRouter, hoặc OpenAI nếu Anh/Chị có key.",
    "",
    "Anh/Chị chỉ cần nhắn kiểu: “quảng cáo bị từ chối”, “page bị hạn chế”, “không nhận mã 2FA”, em sẽ đi theo luồng phù hợp.",
    "Muốn tạo hồ sơ báo cáo có hỏi từng bước, nhắn: báo cáo.",
    "Muốn xem toàn bộ link chính thức, nhắn: link hỗ trợ."
  ].join("\n");
}

function metaAiFlow() {
  return [
    "Về Meta AI/Llama, em giải thích gọn cho Anh/Chị như này:",
    "",
    "1. Meta AI trong app Facebook/Messenger hiện không có API công khai để gắn trực tiếp vào bot Page như một tài khoản Meta AI chính thức.",
    "2. Cách hợp lệ là dùng mô hình Llama hoặc endpoint AI tương thích OpenAI qua nhà cung cấp có API như Groq, OpenRouter hoặc endpoint Llama hợp lệ khác.",
    "3. Bản bot này hỗ trợ sẵn các chế độ:",
    "- AI_PROVIDER=gemini: chạy Gemini như hiện tại.",
    "- AI_PROVIDER=groq: dùng Groq với model Llama nếu có GROQ_API_KEY.",
    "- AI_PROVIDER=openrouter: dùng OpenRouter nếu có OPENROUTER_API_KEY.",
    "- AI_PROVIDER=llama: dùng endpoint Llama/custom nếu có LLAMA_API_KEY, LLAMA_BASE_URL và LLAMA_MODEL.",
    "",
    "Link chính thức để Anh/Chị tham khảo:",
    `- Meta AI: ${SUPPORT_LINKS.metaAi}`,
    `- Llama: ${SUPPORT_LINKS.llama}`,
    `- Meta for Developers: ${SUPPORT_LINKS.metaDevelopers}`,
    "",
    "Nếu Anh/Chị muốn miễn phí ổn định nhất trước mắt, cứ giữ Gemini. Khi có key Llama/Groq/OpenRouter, chỉ cần đổi biến môi trường, không phải sửa code."
  ].join("\n");
}

function supportLinksFlow() {
  return [
    "Em gửi Anh/Chị bộ link hỗ trợ chính thức hay dùng của Facebook/Meta:",
    "",
    "1. Trung tâm chung",
    `- Facebook Help Center: ${SUPPORT_LINKS.help}`,
    `- Support Inbox/Hộp thư hỗ trợ: ${SUPPORT_LINKS.supportInbox}`,
    `- Báo cáo sự cố Facebook: ${SUPPORT_LINKS.reportProblem}`,
    `- Tiêu chuẩn cộng đồng Meta: ${SUPPORT_LINKS.policies}`,
    "",
    "2. Tài khoản và bảo mật",
    `- Tài khoản bị hack: ${SUPPORT_LINKS.hackedAccount}`,
    `- Tìm/khôi phục tài khoản: ${SUPPORT_LINKS.loginIdentify}`,
    `- Khôi phục tài khoản: ${SUPPORT_LINKS.accountRecovery}`,
    `- Tài khoản bị khóa/checkpoint: ${SUPPORT_LINKS.lockedAccount}`,
    `- Security Checkup: ${SUPPORT_LINKS.securityCheckup}`,
    `- Xác thực 2 yếu tố: ${SUPPORT_LINKS.twoFactor}`,
    `- Trạng thái tài khoản: ${SUPPORT_LINKS.accountStatus}`,
    "",
    "3. Page, Business và quảng cáo",
    `- Account Quality: ${SUPPORT_LINKS.accountQuality}`,
    `- Meta Business Help Center: ${SUPPORT_LINKS.businessHelp}`,
    `- Business Support Home: ${SUPPORT_LINKS.businessSupportHome}`,
    `- Business Settings: ${SUPPORT_LINKS.businessSettings}`,
    `- Ads Manager: ${SUPPORT_LINKS.adsManager}`,
    `- Ads Library: ${SUPPORT_LINKS.adsLibrary}`,
    `- Commerce Manager: ${SUPPORT_LINKS.commerceManager}`,
    "",
    "4. Báo cáo, bản quyền, thương hiệu",
    `- Báo cáo giả mạo: ${SUPPORT_LINKS.impersonation}`,
    `- Bản quyền/Copyright: ${SUPPORT_LINKS.copyright}`,
    `- Form báo cáo copyright: ${SUPPORT_LINKS.copyrightForm}`,
    `- Trademark/Nhãn hiệu: ${SUPPORT_LINKS.trademark}`,
    `- Brand Rights Protection: ${SUPPORT_LINKS.brandRightsProtection}`,
    `- Lừa đảo/phishing: ${SUPPORT_LINKS.scams}`,
    "",
    "5. Quyền riêng tư và kiếm tiền",
    `- Privacy Center: ${SUPPORT_LINKS.privacyCenter}`,
    `- Privacy Checkup: ${SUPPORT_LINKS.privacyCheckup}`,
    `- Professional Dashboard: ${SUPPORT_LINKS.professionalDashboard}`,
    `- Công cụ kiếm tiền cho creator: ${SUPPORT_LINKS.creatorsMonetization}`,
    "",
    "6. AI và developer",
    `- Meta AI: ${SUPPORT_LINKS.metaAi}`,
    `- Llama: ${SUPPORT_LINKS.llama}`,
    `- Meta for Developers: ${SUPPORT_LINKS.metaDevelopers}`,
    "",
    "Lưu ý: Anh/Chị chỉ nên đăng nhập và gửi giấy tờ trên các trang chính thức facebook.com, business.facebook.com, meta.com. Không nhập mật khẩu/mã 2FA/token vào link lạ."
  ].join("\n");
}

function impersonationFlow() {
  return [
    "Em xử lý theo luồng báo cáo giả mạo nhé.",
    "",
    "1. Anh/Chị chuẩn bị:",
    "- Link tài khoản/Page giả mạo.",
    "- Link tài khoản/Page thật của Anh/Chị hoặc người bị giả mạo.",
    "- Ảnh chụp màn hình tên, ảnh đại diện, bài viết/tin nhắn giả mạo nếu có.",
    "- Mô tả ngắn: họ đang giả mạo ai, gây hại như thế nào.",
    "",
    "2. Cách báo cáo chính thức:",
    `- Mở hướng dẫn của Facebook: ${SUPPORT_LINKS.impersonation}`,
    "- Vào profile/Page giả mạo.",
    "- Chọn dấu ba chấm hoặc Tìm hỗ trợ/Báo cáo.",
    "- Chọn giả mạo người khác rồi làm theo hướng dẫn.",
    "",
    "3. Mẫu nội dung báo cáo:",
    "Tài khoản/Page này đang giả mạo tôi hoặc thương hiệu của tôi. Họ sử dụng tên, hình ảnh hoặc nội dung gây nhầm lẫn để liên hệ người khác. Vui lòng xem xét và xử lý tài khoản/Page giả mạo này.",
    "",
    "Gửi em link tài khoản/Page giả mạo, em sẽ giúp Anh/Chị viết bản báo cáo rõ hơn. Anh/Chị là người bấm gửi báo cáo trên trang chính thức của Meta."
  ].join("\n");
}

function twoFactorFlow() {
  return [
    "Luồng xử lý khi không nhận được mã đăng nhập/2FA:",
    "",
    "1. Kiểm tra Anh/Chị còn đăng nhập Facebook ở thiết bị nào không. Nếu còn, vào Cài đặt > Mật khẩu và bảo mật > Xác thực 2 yếu tố.",
    "2. Thử các phương án: mã từ ứng dụng xác thực, SMS, email, mã khôi phục, thiết bị đã đăng nhập.",
    "3. Kiểm tra giờ trên điện thoại có đúng không nếu dùng app xác thực.",
    "4. Nếu đổi số điện thoại/email gần đây, kiểm tra email cũ xem Facebook có gửi thông báo thay đổi không.",
    "5. Nếu nghi bị chiếm tài khoản, dùng luồng khôi phục chính thức.",
    "",
    `Hướng dẫn 2FA chính thức: ${SUPPORT_LINKS.twoFactor}`,
    `Khôi phục khi nghi bị hack: ${SUPPORT_LINKS.hackedAccount}`,
    "",
    "Không gửi mã 2FA cho bất kỳ ai, kể cả bot. Nếu Anh/Chị gửi nội dung thông báo lỗi, hãy che mã đăng nhập trước."
  ].join("\n");
}

function loginAlertFlow() {
  return [
    "Nếu có thiết bị lạ đăng nhập, làm ngay theo thứ tự này:",
    "",
    "1. Đổi mật khẩu Facebook từ thiết bị Anh/Chị tin tưởng.",
    "2. Vào Nơi Anh/Chị đã đăng nhập và đăng xuất tất cả thiết bị lạ.",
    "3. Bật xác thực 2 yếu tố.",
    "4. Bật cảnh báo đăng nhập lạ.",
    "5. Kiểm tra email, số điện thoại, tài khoản liên kết, Page, Business và tài khoản quảng cáo xem có ai bị thêm lạ không.",
    "",
    `Công cụ chính thức: ${SUPPORT_LINKS.securityCheckup}`,
    `Nếu nghi bị hack: ${SUPPORT_LINKS.hackedAccount}`,
    `Privacy Checkup: ${SUPPORT_LINKS.privacyCheckup}`,
    "",
    "Em không thể tự giám sát thiết bị đăng nhập cá nhân theo thời gian thực vì Facebook không mở API đó cho bot Page. Nhưng khi Anh/Chị nhận cảnh báo, gửi nội dung cảnh báo cho em, em sẽ hướng dẫn bước tiếp theo."
  ].join("\n");
}

function hackedAccountFlow() {
  return [
    "Luồng xử lý tài khoản Facebook bị hack:",
    "",
    `1. Mở công cụ khôi phục chính thức: ${SUPPORT_LINKS.hackedAccount}`,
    `2. Nếu cần tìm tài khoản: ${SUPPORT_LINKS.loginIdentify}`,
    "3. Dùng thiết bị và mạng Anh/Chị từng đăng nhập trước đây.",
    "4. Nếu email/số điện thoại bị đổi, kiểm tra email cũ để tìm link đảo ngược thay đổi.",
    "5. Sau khi vào lại được: đổi mật khẩu, bật 2FA, xóa thiết bị lạ, kiểm tra Page/Business/Ads.",
    "6. Kiểm tra app/website đã liên kết và gỡ app lạ.",
    "",
    "Không gửi mật khẩu, mã 2FA, cookie hoặc token. Nếu ai đòi tiền/mã để mở khóa nhanh, hãy coi là lừa đảo."
  ].join("\n");
}

function hackedPageFlow() {
  return [
    "Luồng xử lý Page/Fanpage bị mất quyền hoặc bị chiếm:",
    "",
    `1. Mở hướng dẫn khôi phục Page chính thức: ${SUPPORT_LINKS.hackedPage}`,
    `2. Vào Business Settings nếu Page nằm trong Business: ${SUPPORT_LINKS.businessSettings}`,
    `3. Kiểm tra Business Support Home: ${SUPPORT_LINKS.businessSupportHome}`,
    "4. Chuẩn bị bằng chứng: link Page, vai trò quản trị trước đây, ảnh chụp email/thông báo thay đổi quyền, Business ID nếu có.",
    "5. Kiểm tra người lạ, đối tác lạ, app lạ, tài khoản quảng cáo lạ trong Business.",
    "6. Nếu tài khoản cá nhân admin cũng bị hack, xử lý tài khoản cá nhân trước.",
    "",
    "Gửi em: Anh/Chị còn vào được tài khoản cá nhân không, còn thấy Page trong Business không, Page mất quyền từ lúc nào. Em sẽ viết checklist khôi phục sát hơn."
  ].join("\n");
}

function lockedAccountFlow() {
  return [
    "Nếu tài khoản bị khóa, checkpoint, hạn chế hoặc vô hiệu hóa:",
    "",
    `1. Kiểm tra luồng khôi phục tài khoản: ${SUPPORT_LINKS.accountRecovery}`,
    `2. Nếu Facebook báo tài khoản bị khóa: ${SUPPORT_LINKS.lockedAccount}`,
    `3. Tìm lại tài khoản: ${SUPPORT_LINKS.loginIdentify}`,
    `4. Kiểm tra Support Inbox: ${SUPPORT_LINKS.supportInbox}`,
    "5. Đăng nhập bằng thiết bị và mạng Anh/Chị từng dùng trước đây.",
    "6. Làm theo màn hình xác minh danh tính nếu Facebook yêu cầu.",
    "7. Không gửi giấy tờ tùy thân cho bot hoặc người lạ; chỉ gửi trong biểu mẫu chính thức của Facebook.",
    "",
    "Anh/Chị gửi em nguyên văn thông báo Facebook đang hiện, em sẽ giải thích và chỉ bước tiếp theo."
  ].join("\n");
}

function pageQualityFlow() {
  return [
    "Luồng xử lý Page bị hạn chế, cảnh báo hoặc vi phạm:",
    "",
    `1. Vào Account Quality/Chất lượng tài khoản: ${SUPPORT_LINKS.accountQuality}`,
    `2. Kiểm tra Support Inbox nếu có thông báo: ${SUPPORT_LINKS.supportInbox}`,
    "3. Chọn Page đang bị cảnh báo để xem lỗi cụ thể.",
    "4. Xác định loại lỗi: nội dung bị gỡ, spam, mạo danh, bản quyền, lừa đảo, chính sách thương mại hoặc tiêu chuẩn cộng đồng.",
    "5. Nếu có nút Yêu cầu xem xét/Kháng nghị, hãy chuẩn bị nội dung ngắn gọn, lịch sự và có bằng chứng.",
    "6. Gỡ hoặc sửa các bài có nguy cơ lặp lại lỗi; kiểm tra quyền admin xem có người lạ đăng bài không.",
    "",
    `Tiêu chuẩn cộng đồng Meta: ${SUPPORT_LINKS.policies}`,
    "",
    "Gửi em nguyên văn lỗi Page đang báo, em sẽ soạn mẫu kháng nghị phù hợp."
  ].join("\n");
}

function adsFlow() {
  return [
    "Luồng xử lý quảng cáo hoặc tài khoản quảng cáo bị lỗi:",
    "",
    `1. Vào Ads Manager: ${SUPPORT_LINKS.adsManager}`,
    `2. Vào Account Quality để xem lý do hạn chế/từ chối: ${SUPPORT_LINKS.accountQuality}`,
    `3. Mở Business Support Home nếu cần ticket hỗ trợ: ${SUPPORT_LINKS.businessSupportHome}`,
    `4. Kiểm tra Ads Library để so sánh quảng cáo đang chạy: ${SUPPORT_LINKS.adsLibrary}`,
    "5. Nếu quảng cáo bị từ chối: kiểm tra nội dung, ảnh, landing page, tuyên bố gây hiểu nhầm, trước/sau, sức khỏe, tài chính, cam kết kết quả.",
    "6. Nếu tài khoản quảng cáo bị hạn chế: kiểm tra danh tính, phương thức thanh toán, quyền Business, lịch sử vi phạm.",
    "7. Nếu có nút Yêu cầu xem xét, gửi kháng nghị ngắn gọn và đúng trọng tâm.",
    "",
    "Mẫu kháng nghị:",
    "Chúng tôi tin rằng quảng cáo/tài khoản này bị đánh giá nhầm. Nội dung tuân thủ chính sách Meta, không gây hiểu nhầm và không né tránh hệ thống xét duyệt. Vui lòng xem xét lại.",
    "",
    "Gửi em ảnh chụp lỗi hoặc nguyên văn lý do từ chối, em sẽ phân tích và viết kháng nghị sát hơn."
  ].join("\n");
}

function businessVerificationFlow() {
  return [
    "Luồng xử lý Meta Business Suite/Business Manager/xác minh doanh nghiệp:",
    "",
    `1. Vào Business Settings: ${SUPPORT_LINKS.businessSettings}`,
    `2. Mở Business Support Home: ${SUPPORT_LINKS.businessSupportHome}`,
    "3. Kiểm tra Business Info: tên pháp lý, địa chỉ, website, số điện thoại, email doanh nghiệp.",
    "4. Kiểm tra Security Center xem có yêu cầu bật 2FA hoặc xác minh không.",
    "5. Chuẩn bị giấy tờ trùng thông tin doanh nghiệp: đăng ký kinh doanh, hóa đơn/giấy tờ địa chỉ, website có tên doanh nghiệp.",
    "6. Nếu bị từ chối, so sánh từng trường thông tin trên giấy tờ với thông tin trong Business.",
    "",
    `Tài liệu xác minh doanh nghiệp Facebook: ${SUPPORT_LINKS.businessVerificationDocs}`,
    `Trung tâm hỗ trợ doanh nghiệp: ${SUPPORT_LINKS.businessHelp}`,
    "",
    "Gửi em thông báo lỗi xác minh, em sẽ chỉ ra phần nào có khả năng không khớp."
  ].join("\n");
}

function messengerFlow() {
  return [
    "Luồng xử lý Messenger/Page Inbox không gửi hoặc không nhận tin:",
    "",
    "1. Kiểm tra Page có bật nhắn tin không.",
    "2. Kiểm tra Anh/Chị đang xem đúng hộp thư trong Meta Business Suite/Page Inbox.",
    "3. Nếu dùng bot hoặc công cụ bên thứ ba, kiểm tra quyền webhook, quyền app và handover/primary receiver.",
    "4. Test bằng tài khoản không phải admin Page để tránh nhầm với chế độ app đang phát triển.",
    "5. Nếu tin nhắn gửi được nhưng bot không trả lời, kiểm tra Render Logs, PAGE_ACCESS_TOKEN và webhook field messages.",
    "",
    `Hướng dẫn Messenger chính thức: ${SUPPORT_LINKS.messengerIssue}`,
    "",
    "Anh/Chị gửi em: Anh/Chị không nhận tin trong Page Inbox, bot không nhận, hay bot nhận nhưng không trả lời. Em sẽ khoanh vùng tiếp."
  ].join("\n");
}

function adminAccessFlow() {
  return [
    "Luồng xử lý quyền quản trị Page/Business:",
    "",
    `1. Vào Business Settings: ${SUPPORT_LINKS.businessSettings}`,
    `2. Kiểm tra Business Support Home nếu bị mất quyền hoặc có ticket: ${SUPPORT_LINKS.businessSupportHome}`,
    "3. Kiểm tra People/Người dùng, Partners/Đối tác, Pages/Tài sản.",
    "4. Gỡ người lạ hoặc đối tác lạ nếu Anh/Chị còn quyền quản trị hợp lệ.",
    "5. Bật 2FA bắt buộc cho người quản lý Business nếu có tùy chọn.",
    "6. Nếu Anh/Chị bị mất quyền, thu thập bằng chứng quyền cũ, email thông báo, link Page, Business ID.",
    "",
    "Không thêm admin lạ, không cấp toàn quyền cho người hỗ trợ không đáng tin. Nếu cần phân quyền, hãy cấp mức thấp nhất đủ dùng."
  ].join("\n");
}

function pageNameFlow() {
  return [
    "Luồng đổi tên Page hoặc username Page:",
    "",
    "1. Kiểm tra Anh/Chị có quyền quản lý Page đủ cao không.",
    "2. Tên mới phải phản ánh đúng Page, không gây nhầm lẫn, không mạo danh, không dùng ký tự/thương hiệu trái phép.",
    "3. Vào Page Settings hoặc Page access để tìm phần chỉnh sửa tên/username.",
    "4. Nếu bị từ chối, chờ một thời gian rồi thử tên gần với thương hiệu thật hơn.",
    "5. Nếu Page vừa đổi tên hoặc vừa chuyển quyền, Meta có thể hạn chế đổi tiếp trong một thời gian.",
    "",
    "Gửi em tên Page cũ và tên muốn đổi, em sẽ kiểm tra rủi ro bị từ chối và đề xuất tên an toàn hơn."
  ].join("\n");
}

function contentReportFlow() {
  return [
    "Luồng báo cáo bài viết/nội dung vi phạm:",
    "",
    "1. Mở bài viết/bình luận/tin nhắn cần báo cáo.",
    "2. Chọn dấu ba chấm hoặc Báo cáo/Tìm hỗ trợ.",
    "3. Chọn lý do đúng nhất: giả mạo, lừa đảo, quấy rối, đe dọa, bạo lực, spam, bản quyền, nội dung nhạy cảm.",
    "4. Chụp màn hình và lưu link nội dung trước khi báo cáo.",
    "5. Nếu liên quan tài khoản/Page của Anh/Chị, ghi rõ tác động và bằng chứng sở hữu.",
    "",
    `Tiêu chuẩn cộng đồng: ${SUPPORT_LINKS.policies}`,
    `Bản quyền/Copyright: ${SUPPORT_LINKS.copyright}`,
    `Trademark/Nhãn hiệu: ${SUPPORT_LINKS.trademark}`,
    "",
    "Gửi em nội dung hoặc mô tả vi phạm, em sẽ giúp chọn lý do báo cáo và viết mô tả ngắn gọn."
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
    `6. Chạy Privacy Checkup: ${SUPPORT_LINKS.privacyCheckup}`,
    "",
    "Anh/Chị có thể gửi nội dung tin nhắn đáng ngờ, em sẽ giúp phân tích có phải lừa đảo không."
  ].join("\n");
}

function monetizationFlow() {
  return [
    "Luồng kiểm tra kiếm tiền/monetization Facebook:",
    "",
    "1. Vào Professional Dashboard hoặc Meta Business Suite để xem trạng thái kiếm tiền.",
    "2. Kiểm tra Page/Profile có vi phạm tiêu chuẩn cộng đồng, bản quyền, nội dung không nguyên gốc hoặc spam không.",
    "3. Kiểm tra từng sản phẩm: Stars, Reels, in-stream ads, bonus nếu có.",
    "4. Nếu video/Reels không đủ điều kiện, kiểm tra bản quyền âm thanh, nội dung tái sử dụng, nội dung câu kéo tương tác.",
    "5. Nếu có nút kháng nghị, mô tả ngắn gọn vì sao nội dung là nguyên gốc và tuân thủ chính sách.",
    "",
    `Kiểm tra Account Quality trước: ${SUPPORT_LINKS.accountQuality}`,
    `Professional Dashboard: ${SUPPORT_LINKS.professionalDashboard}`,
    `Công cụ kiếm tiền cho creator: ${SUPPORT_LINKS.creatorsMonetization}`,
    "",
    "Gửi em thông báo không đủ điều kiện, em sẽ phân tích lý do và viết checklist sửa."
  ].join("\n");
}

function hasAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}
