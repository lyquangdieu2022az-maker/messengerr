# Facebook AI Support Bot

Bot Messenger dung OpenAI de tra loi co logic, nho ngu canh theo tung nguoi dung va co the gui kem audio giong noi AI. Bot uu tien ho tro Facebook/Meta, nhung van co the tro chuyen tu nhien ve chu de khac nhu nau an, vui choi, hoc tap, cong viec, viet noi dung va tam su.

## Tinh nang

- Webhook Facebook Messenger: xac minh `GET /webhook`, nhan tin nhan `POST /webhook`.
- AI tra loi bang Responses API voi model mac dinh `gpt-5.4`.
- Tro chuyen da nang: hoi Facebook thi xu ly chuyen sau, hoi chuyen khac thi tra loi dung chu de.
- Tro ly tao bao cao/khang nghi ban tu dong: hoi tung thong tin, soan san noi dung, gui link chinh thuc de nguoi dung tu bam gui.
- Tao trang ban soan tren Render co nut copy noi dung va nut mo link chinh thuc cua Meta/Facebook.
- Bo nho hoi thoai theo PSID trong `data/memory.json`.
- Lenh luu/xoa ghi nho: `nho rang ...`, `quen toi`.
- Nhan audio tu Messenger, chuyen thanh text bang `gpt-4o-mini-transcribe`.
- Gui audio tra loi bang `gpt-4o-mini-tts` khi bat `bat giong noi`.
- Kiem tra chu ky webhook bang `APP_SECRET` neu ban cau hinh.

## Cai dat

Node.js portable da duoc cai vao `tools/node` trong workspace nay. Neu can cai lai packages:

```bash
.\tools\node\npm.cmd install
copy .env.example .env
```

Dien cac bien trong `.env`:

- `OPENAI_API_KEY`: API key OpenAI.
- `VERIFY_TOKEN`: chuoi ban tu dat, phai giong trong Meta Developer Dashboard.
- `PAGE_ACCESS_TOKEN`: Page access token cua Facebook Page.
- `PAGE_ID`: ID cua Page. Neu endpoint Page-specific loi, co the bo trong de dung `/me/messages`.
- `APP_SECRET`: App Secret cua Meta app, nen bat khi chay that.
- `PUBLIC_BASE_URL`: URL HTTPS cong khai tro vao server, vi du URL ngrok.
- `REPORT_FILE_PATH`: tuy chon, noi luu cac ban soan bao cao tam thoi. De trong thi dung `data/reports.json`.

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

## Lenh cho nguoi dung trong Messenger

- `help`: xem huong dan nhanh.
- `bao cao`: mo menu tao ho so bao cao/khang nghi ban tu dong.
- `bao cao gia mao`: tao ho so bao cao tai khoan/Page gia mao.
- `khang nghi tai khoan bi khoa`: tao noi dung khang nghi tai khoan bi khoa/checkpoint.
- `nho rang shop cua toi ban my pham`: luu thong tin vao bo nho.
- `quen toi`: xoa ghi nho.
- `bat giong noi`: gui them file audio AI sau cau tra loi.
- `tat giong noi`: tat audio.

## Luu y an toan

Bot nay khong the va khong nen hua xu ly 100% moi van de Facebook. Cac viec nhu khoi phuc tai khoan, xac minh doanh nghiep, go khoa Page hoac xet duyet quang cao van phu thuoc Meta. Bot se huong dan chan doan, chuan bi thong tin va di theo kenh chinh thuc.

Khong gui mat khau, ma 2FA, token, cookie hoac giay to nhay cam vao bot.

## Dung AI mien phi hon

OpenAI API thuong can credits/billing. Neu het credits, bot van nhan tin Messenger nhung phan AI se tra fallback.

Co the chuyen phan chat chu sang Gemini free tier:

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=key_lay_tu_Google_AI_Studio
GEMINI_MODEL=gemini-2.5-flash-lite
VOICE_REPLIES_DEFAULT=false
```

Khi dung Gemini, tinh nang chat chu co the dung free tier co gioi han. Tinh nang audio/transcribe van can OpenAI API, nen neu muon mien phi thi nen tat tra loi bang giong noi.

Neu van dung OpenAI, kiem tra:

```env
OPENAI_API_KEY=key_con_hoat_dong
OPENAI_FALLBACK_MODEL=gpt-4o-mini
OPENAI_PRIMARY_TIMEOUT_MS=12000
AI_REPLY_TIMEOUT_MS=30000
```
