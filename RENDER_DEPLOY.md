# Deploy len Render

Project nay da co `render.yaml`, `package.json` va script `npm start`, nen Render co the deploy truc tiep.

## Cach nhanh nhat

1. Dua thu muc nay len GitHub/GitLab.
2. Vao https://dashboard.render.com.
3. Chon **New** -> **Blueprint** neu muon Render doc `render.yaml`.
4. Hoac chon **New** -> **Web Service** -> connect repo.
5. Neu tao Web Service thu cong, cau hinh:

```text
Runtime: Node
Build Command: npm install
Start Command: npm start
Health Check Path: /
```

## Environment variables can dien tren Render

Bat buoc:

```text
AI_PROVIDER=gemini
GEMINI_API_KEY=key_lay_tu_Google_AI_Studio
GEMINI_MODEL=gemini-2.5-flash-lite
GEMINI_FALLBACK_MODELS=gemini-2.5-flash
GEMINI_MAX_RETRIES=1
VERIFY_TOKEN=tu_dat_mot_chuoi_bat_ky
PAGE_ACCESS_TOKEN=EAAB...
PAGE_ID=id_page
APP_SECRET=app_secret_meta
PUBLIC_BASE_URL=https://ten-service.onrender.com
```

Khuyen nghi giu mac dinh:

```text
NODE_VERSION=22.22.0
GRAPH_API_VERSION=v25.0
BOT_NAME=Tro Ly Facebook AI
VOICE_REPLIES_DEFAULT=false
SETUP_MESSENGER_PROFILE_ON_START=true
SETUP_MESSENGER_GREETING_ON_START=false
AI_REPLY_TIMEOUT_MS=30000
MAX_HISTORY_MESSAGES=16
MAX_MEMORY_FACTS=40
REPORT_FILE_PATH=
AUTOMATION_FILE_PATH=
```

Khi dung Gemini, phan chat chu co the chay theo free tier cua Google. Neu khong co OpenAI key, bot se tu bo qua voice/audio de tranh loi.

## Neu muon dung Llama / Meta-style AI

Meta AI trong Facebook/Messenger hien khong co API cong khai de gan truc tiep vao Page bot. Ban moi nay da them cach hop le: dung Llama qua provider co API.

Chon mot trong cac cau hinh sau tren Render:

```text
AI_PROVIDER=groq
GROQ_API_KEY=key_cua_groq
LLAMA_MODEL=llama-3.3-70b-versatile
LLAMA_MAX_RETRIES=1
```

Hoac:

```text
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=key_cua_openrouter
LLAMA_MODEL=meta-llama/llama-3.3-70b-instruct
OPENROUTER_SITE_URL=https://facebook-ai-support-bot.onrender.com
OPENROUTER_APP_NAME=Tro Ly Facebook AI
LLAMA_MAX_RETRIES=1
```

Hoac neu provider cua ban dua endpoint OpenAI-compatible rieng:

```text
AI_PROVIDER=llama
LLAMA_API_KEY=key_cua_provider
LLAMA_BASE_URL=https://provider.example.com/openai/v1
LLAMA_MODEL=ten_model_llama
LLAMA_MAX_RETRIES=1
```

Neu chua co key Groq/OpenRouter/Llama, cu giu `AI_PROVIDER=gemini`.

Neu dung Render free plan, co the de trong:

```text
MEMORY_FILE_PATH=
```

Neu sau nay dung persistent disk tren Render, mount disk vi du `/var/data`, roi dat:

```text
MEMORY_FILE_PATH=/var/data/memory.json
REPORT_FILE_PATH=/var/data/reports.json
```

`PUBLIC_BASE_URL` nen dung dung URL Render cua ban. Bien nay giup bot tao nut "Mo ban soan" de nguoi dung copy noi dung bao cao/khieu nai tren trang rieng cua bot.

## Bat tu dong dang bai va rep binh luan

Mac dinh ban moi de tat de bot khong tu dang khi ban chua san sang:

```text
AUTO_POST_ENABLED=false
COMMENT_AUTO_REPLY_ENABLED=false
```

Khi Meta app da co quyen, doi thanh:

```text
AUTO_POST_ENABLED=true
AUTO_POST_TIMES=08:00,12:00,16:00
AUTO_POST_UTC_OFFSET_MINUTES=420
AUTO_POST_CATCH_UP_MINUTES=90
AUTO_POST_CHECK_INTERVAL_MS=300000
COMMENT_AUTO_REPLY_ENABLED=true
COMMENT_REPLY_TTL_DAYS=14
```

Y nghia:

- `AUTO_POST_TIMES=08:00,12:00,16:00`: 1 ngay 3 bai, cach nhau 4 tieng theo gio Viet Nam.
- `AUTO_POST_UTC_OFFSET_MINUTES=420`: mui gio Viet Nam UTC+7.
- `AUTO_POST_CATCH_UP_MINUTES=90`: neu server ngu qua khung gio qua lau thi bo qua, tranh dang don nhieu bai.
- `COMMENT_AUTO_REPLY_ENABLED=true`: bot tu rep binh luan Page nhan qua webhook `feed`.

Can bat trong Meta:

```text
pages_manage_posts
pages_read_engagement
pages_manage_engagement
Webhook field: feed
```

Luu y: app co the can App Review cua Meta neu muon dung cho nguoi dung ngoai admin/developer/tester.

## Gan vao Meta/Facebook

Sau khi Render deploy xong, lay URL service, vi du:

```text
https://facebook-ai-support-bot.onrender.com
```

Vao Meta Developer Dashboard -> Messenger -> Webhooks/Messenger API Setup:

```text
Callback URL: https://facebook-ai-support-bot.onrender.com/webhook
Verify Token: giong bien VERIFY_TOKEN tren Render
```

Subscribe:

```text
messages
messaging_postbacks
```

Gui tin nhan vao Page de test. Neu app con Development Mode, chi admin/developer/tester cua Meta App moi test duoc.
