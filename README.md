# Just Vent

> A safe, judgment-free space to say what's on your mind — and actually feel heard.

![React](https://img.shields.io/badge/React_18-20232A?style=flat&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black)
![Claude](https://img.shields.io/badge/Claude_AI-D97757?style=flat&logo=anthropic&logoColor=white)

---

## What is this?

**Just Vent** is an emotional support app where you type or speak your thoughts and receive a warm, compassionate AI response — never advice, never judgment, just presence.

It's built for those moments when you need to get something off your chest but don't want to burden anyone.

---

## Features

- **Vent freely** — type up to 2,000 characters or use your voice
- **Voice input** — speak your thoughts using the browser's Speech API
- **Five response tones** — choose how you want to be met:
  - *Just listen* — quiet, reflective presence
  - *Be warmer* — nurturing, emotionally rich support
  - *Some perspective* — gentle reframing when you're ready
  - *Encourage me* — reflects back your own strength and resilience
  - *Find the good* — gently guides toward gratitude, without forcing it
- **Mood tagging** — label how you're feeling before you start
- **Multi-turn conversations** — the AI remembers your session context
- **Multilingual** — vent in any of 8 supported languages (see table below)
- **Virtual keyboard** — on-screen input for accessibility
- **Auth** — secure sign-in via Firebase Authentication

---

## Tech Stack

| Layer      | Technology                                         |
|------------|----------------------------------------------------|
| Frontend   | React 18 · Vite · Tailwind CSS · React Router v6  |
| Auth       | Firebase Authentication                            |
| Backend    | Firebase Cloud Functions (Node 20)                 |
| Database   | Firebase Firestore                                 |
| AI         | Anthropic Claude (`claude-sonnet-4-6`)             |
| Speech     | OpenAI Whisper (voice message transcription)       |
| Hosting    | Firebase Hosting                                   |

---

## Project Structure

```
just-vent/
├── frontend/
│   └── src/
│       ├── components/     # VentArea, MicButton, ResponseArea, Navbar, …
│       ├── context/        # AuthContext
│       ├── hooks/          # useVentState, useAudioRecorder, useSpeechRecognition
│       ├── pages/          # Home, SignIn, SignUp, Settings
│       ├── services/       # Firebase client, ventService
│       └── utils/          # languages
└── functions/
    └── index.js            # Cloud Function → Anthropic API
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- Firebase CLI — `npm install -g firebase-tools`
- A Firebase project with **Authentication** and **Firestore** enabled
- An [Anthropic API key](https://console.anthropic.com/)

### 1. Clone & install

```bash
git clone https://github.com/MuKuNdSaNjAy/just-vent.git
cd just-vent

cd frontend && npm install
cd ../functions && npm install
```

### 2. Configure environment

**`frontend/.env.local`**
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
```

**`functions/.env`**
```env
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-proj-...
```

### 3. Run locally

```bash
# Terminal 1 — frontend
cd frontend && npm run dev

# Terminal 2 — Firebase emulator
firebase emulators:start --only functions
```

### 4. Deploy

```bash
# Build frontend
cd frontend && npm run build

# Deploy everything
firebase deploy
```

---

## Supported Languages

| Code | Language |
|------|----------|
| `en` | English  |
| `hi` | हिंदी    |
| `bn` | বাংলা    |
| `mr` | मराठी    |
| `ta` | தமிழ்    |
| `te` | తెలుగు   |
| `kn` | ಕನ್ನಡ    |
| `ml` | മലയാളം   |

---

## How it Works

1. User types or speaks a vent and picks a response tone
2. The frontend sends the conversation history + mood + tone to a Firebase Cloud Function
3. The function calls the Anthropic Claude API with a carefully crafted system prompt tuned to each tone
4. Claude's response is streamed back and displayed in the UI
5. The session continues until the user is done — then a warm closing message ends it

---

*Built with care at IIT — because sometimes you just need to vent.*

---

## License

MIT © Mukund Sanjay Bharani
