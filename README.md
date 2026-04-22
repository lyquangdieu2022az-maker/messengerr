# Facebook AI Support Bot

Bot Messenger dung Gemini de tra loi co logic, nho ngu canh theo tung nguoi dung va ho tro Facebook/Meta. Bot van co the tro chuyen tu nhien ve chu de khac nhu nau an, vui choi, hoc tap, cong viec, viet noi dung va tam su.

## Ban v17

Ban nay giu day du tinh nang v16 va them lop AI provider moi de co the dung Llama/Groq/OpenRouter khi Anh/Chi co key. Neu khong co key khac, cu giu Gemini nhu hien tai.

## Tinh nang

- Webhook Facebook Messenger: xac minh `GET /webhook`, nhan tin nhan `POST /webhook`.
- AI tra loi bang Gemini voi model mac dinh `gemini-2.5-flash-lite`.
- Tuy chon doi AI provider: `gemini`, `groq`, `openrouter`, `llama`, `openai`.
- Ho tro Llama/Meta-style AI qua API hop le nhu Groq, OpenRouter hoac endpoint OpenAI-compatible tuy chinh. Bot khong tu nhan la Meta AI chinh thuc.
- Tro chuyen da nang: hoi Facebook thi xu ly chuyen sau, hoi chuyen khac thi tra loi dung chu de.
- Tro ly tao bao cao/khang nghi ban tu dong: hoi tung thong tin, soan san noi dung, gui link chinh thuc de nguoi dung tu bam gui.
- Tao trang ban soan tren Render co nut copy noi dung va nut mo link chinh thuc cua Meta/Facebook.
- Lenh `link ho tro` gui bo link chinh thuc theo nhom: bao mat, Account Quality, Business Support, Ads, ban quyen, trademark, privacy, creator.
- Tu dong dang 3 bai/ngay ve Facebook/Meta neu bat `AUTO_POST_ENABLED=true`. Mac dinh 08:00, 12:00, 16:00 theo gio Viet Nam.
- Tu dong rep binh luan Page neu bat `COMMENT_AUTO_REPLY_ENABLED=true` va Meta app da co quyen/webhook phu hop.
- Tu cai menu co dinh trong Messenger: Hoi AI, Tao bao cao, Tro giup.
- Giong tra loi lich su: bot xung em va goi nguoi can ho tro la Anh/Chi.
- Bo nho hoi thoai theo PSID trong `data/memory.json`.
- Lenh luu/xoa ghi nho: `nho rang ...`, `quen toi`.
- Neu dung Gemini mien phi va khong co OpenAI key, bot tu bo qua voice/audio de tranh loi.
- Kiem tra chu ky webhook bang `APP_SECRET` neu ban cau hinh.

## Cai dat

Node.js portable da duoc cai vao `tools/node` trong workspace nay. Neu can cai lai packages:

```bash
.\tools\node\npm.cmd install
copy .env.example .env
```

Dien cac bien trong `.env`:

- `AI_PROVIDER`: dat `gemini`.
- `GEMINI_API_KEY`: API key Gemini lay tu Google AI Studio.
- `GEMINI_MODEL`: model Gemini, mac dinh `gemini-2.5-flash-lite`.
- Neu muon dung Llama/Groq/OpenRouter: doi `AI_PROVIDER` va them key tuong ung, xem muc "Tuy chon Llama / Meta-style AI".
- `VERIFY_TOKEN`: chuoi ban tu dat, phai giong trong Meta Developer Dashboard.
- `PAGE_ACCESS_TOKEN`: Page access token cua Facebook Page.
- `PAGE_ID`: ID cua Page. Neu endpoint Page-specific loi, co the bo trong de dung `/me/messages`.
- `APP_SECRET`: App Secret cua Meta app, nen bat khi chay that.
- `PUBLIC_BASE_URL`: URL HTTPS cong khai tro vao server, vi du URL ngrok.
- `REPORT_FILE_PATH`: tuy chon, noi luu cac ban soan bao cao tam thoi. De trong thi dung `data/reports.json`.
- `SETUP_MESSENGER_PROFILE_ON_START`: de `true` de bot tu cai nut menu co dinh Messenger khi deploy.
- `AUTO_POST_ENABLED`: de `true` neu muon bot tu dang bai len Page.
- `AUTO_POST_TIMES`: gio dang bai moi ngay, mac dinh `08:00,12:00,16:00`.
- `COMMENT_AUTO_REPLY_ENABLED`: de `true` neu muon bot tu rep binh luan Page.
- `AUTOMATION_FILE_PATH`: tuy chon, noi luu trang thai bai da dang va comment da rep.

## Chay local

```bash
.\run-dev.cmd
```

Hoac:

```bash
.\tools\node\npm.cmd run dev
```

Neu dung ngrok:

```bash
ngrok http 3000
```

Sau do dat:

```env
PUBLIC_BASE_URL=https://your-ngrok-url.ngrok-free.app
```

Callback URL trong Meta:

```text
https://your-ngrok-url.ngrok-free.app/webhook
```

Verify token trong Meta phai trung `VERIFY_TOKEN`.

## Cau hinh Meta/Facebook

1. Tao Meta app va them san pham Messenger.
2. Ket noi app voi Facebook Page.
3. Tao Page access token co quyen Messenger phu hop.
4. Trong Webhooks, nhap Callback URL va Verify Token.
5. Subscribe toi thieu cac field `messages` va `messaging_postbacks`.
6. Gui tin nhan vao Page de test. Khi app con development mode, chi admin/developer/tester cua app nhan phan hoi.

Neu bat tu dong dang bai/rep binh luan, can them quyen va webhook phu hop trong Meta App:

- Dang bai Page: `pages_manage_posts`.
- Doc/quan ly tuong tac de rep binh luan: `pages_read_engagement`, `pages_manage_engagement`.
- Nhan webhook binh luan Page: subscribe field `feed`.
- Mot so app/page co the can app review truoc khi dung cho nguoi dung that.

## Lenh cho nguoi dung trong Messenger

- `help`: xem huong dan nhanh.
- `bao cao`: mo menu tao ho so bao cao/khang nghi ban tu dong.
- `link ho tro`: xem cac link chinh thuc cua Facebook/Meta theo nhom.
- `bao cao gia mao`: tao ho so bao cao tai khoan/Page gia mao.
- `khang nghi tai khoan bi khoa`: tao noi dung khang nghi tai khoan bi khoa/checkpoint.
- `nho rang shop cua toi ban my pham`: luu thong tin vao bo nho.
- `quen toi`: xoa ghi nho.
- `bat giong noi`: gui them file audio AI sau cau tra loi.
- `tat giong noi`: tat audio.

## Menu co dinh Messenger

Sau khi deploy, bot se tu cai menu co dinh neu co:

```env
SETUP_MESSENGER_PROFILE_ON_START=true
SETUP_MESSENGER_GREETING_ON_START=false
PAGE_ACCESS_TOKEN=token_page_cua_ban
```

Nen de `SETUP_MESSENGER_GREETING_ON_START=false` vi mot so app/page bi Meta tu choi truong greeting. Menu co dinh van cai duoc binh thuong.

Menu gom:

- Hoi AI
- Tao bao cao
- Tro giup

Tin nhan binh thuong van hoat dong nhu cu. Menu chi la nut bam nhanh cho nguoi dung.

## Luu y an toan

Bot nay khong the va khong nen hua xu ly 100% moi van de Facebook. Cac viec nhu khoi phuc tai khoan, xac minh doanh nghiep, go khoa Page hoac xet duyet quang cao van phu thuoc Meta. Bot se huong dan chan doan, chuan bi thong tin va di theo kenh chinh thuc.

Khong gui mat khau, ma 2FA, token, cookie hoac giay to nhay cam vao bot.

## Dung Gemini free tier

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=key_lay_tu_Google_AI_Studio
GEMINI_MODEL=gemini-2.5-flash-lite
GEMINI_FALLBACK_MODELS=gemini-2.5-flash
GEMINI_MAX_RETRIES=1
VOICE_REPLIES_DEFAULT=false
```

Tinh nang chat chu co the dung Gemini free tier co gioi han. Neu muon mien phi, nen de `VOICE_REPLIES_DEFAULT=false`.
Neu Gemini bao `503 UNAVAILABLE`, bot se thu lai 1 lan va doi sang model du phong trong `GEMINI_FALLBACK_MODELS`.

Khi khong co OpenAI key, bot se tu bo qua voice/audio de tranh loi. Nguoi dung van chat chu binh thuong.

Sau khi deploy, Render logs nen co dong:

```text
AI provider selected: gemini
```

Neu log hien `AI provider selected: openai` thi Render dang thieu `GEMINI_API_KEY` hoac chua deploy ban moi.

## Tu dong dang bai va rep binh luan

Mac dinh tinh nang nay dang tat de tranh dang ngoai y muon. Khi da cap quyen Meta xong, bat tren Render:

```env
AUTO_POST_ENABLED=true
AUTO_POST_TIMES=08:00,12:00,16:00
AUTO_POST_UTC_OFFSET_MINUTES=420
AUTO_POST_CATCH_UP_MINUTES=90
COMMENT_AUTO_REPLY_ENABLED=true
```

Co che:

- Bot kiem tra lich moi 5 phut.
- Moi ngay dang toi da 3 bai, moi khung gio chi dang 1 lan.
- Chu de tu xoay vong: bao mat tai khoan, 2FA, Page, Messenger, quang cao, Account Quality, gia mao, phishing, ban quyen, privacy, business verification.
- Moi bai co ghi chu nguon tham khao chinh sach:

```text
Nguồn tham khảo: Trung tâm trợ giúp Facebook/Meta. Nội dung do Page tự biên soạn, không đại diện Meta.
```

De han che rui ro ban quyen/chinh sach:

- Chi dang noi dung tu viet, khong copy bai cua nguoi khac.
- Khong dung logo, hinh anh, nhac, video cua ben thu ba neu chua co quyen.
- Neu tham khao chinh sach Facebook/Meta, ghi la "nguon tham khao", khong copy nguyen van dai.
- Khong hua mo khoa 100%, khong noi co quan he noi bo voi Meta/Facebook.
- Khong dang noi dung spam, cau view gay hieu nham, bypass chinh sach hoac huong dan hack.
- Khong yeu cau nguoi doc gui mat khau, ma 2FA, token, cookie hoac giay to nhay cam trong binh luan.

## Tuy chon Llama / Meta-style AI

Meta AI trong app Facebook/Messenger khong co API cong khai de gan truc tiep vao bot Page nhu mot tai khoan Meta AI chinh thuc. Cach hop le la dung Llama hoac mot endpoint AI tuong thich OpenAI.

Dung Groq:

```env
AI_PROVIDER=groq
GROQ_API_KEY=key_cua_groq
LLAMA_MODEL=llama-3.3-70b-versatile
LLAMA_MAX_RETRIES=1
```

Dung OpenRouter:

```env
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=key_cua_openrouter
LLAMA_MODEL=meta-llama/llama-3.3-70b-instruct
OPENROUTER_SITE_URL=https://facebook-ai-support-bot.onrender.com
OPENROUTER_APP_NAME=Tro Ly Facebook AI
LLAMA_MAX_RETRIES=1
```

Dung endpoint Llama/custom OpenAI-compatible:

```env
AI_PROVIDER=llama
LLAMA_API_KEY=key_cua_provider
LLAMA_BASE_URL=https://provider.example.com/openai/v1
LLAMA_MODEL=ten_model_llama
LLAMA_MAX_RETRIES=1
```

Neu chua co cac key tren, giu `AI_PROVIDER=gemini` la on nhat cho ban mien phi.
