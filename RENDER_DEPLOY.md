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
OPENAI_API_KEY=sk-...
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
OPENAI_MODEL=gpt-5.4
OPENAI_REASONING_EFFORT=medium
OPENAI_TTS_MODEL=gpt-4o-mini-tts
OPENAI_TRANSCRIBE_MODEL=gpt-4o-mini-transcribe
OPENAI_TTS_VOICE=marin
BOT_NAME=Tro Ly Facebook AI
VOICE_REPLIES_DEFAULT=false
MAX_HISTORY_MESSAGES=16
MAX_MEMORY_FACTS=40
```

Neu dung Render free plan, co the de trong:

```text
MEMORY_FILE_PATH=
```

Neu sau nay dung persistent disk tren Render, mount disk vi du `/var/data`, roi dat:

```text
MEMORY_FILE_PATH=/var/data/memory.json
```

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
