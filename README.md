# Just Vent

A safe space to vent — type or speak your thoughts and receive a compassionate, non-judgmental AI response.

## Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 18 + Vite + Tailwind CSS      |
| Hosting  | Vercel                              |
| Backend  | Supabase Edge Functions (Deno)      |
| AI       | Anthropic Claude (claude-haiku-4-5) |
| Speech   | Web Speech API (browser-native)     |

## Project Structure

```
just-vent/
├── frontend/                  # React app
│   └── src/
│       ├── components/        # VentArea, MicButton, LanguageSelector, ResponseArea, ApiStatus
│       ├── hooks/             # useSpeechRecognition, useVentState
│       ├── services/          # ventService (Supabase client)
│       └── utils/             # languages
└── supabase/
    └── functions/
        └── vent-response/     # Edge function → Anthropic API
```

## Getting Started

### 1. Frontend

```bash
cd frontend
npm install
cp .env .env.local   # fill in your Supabase URL + anon key
npm run dev
```

### 2. Supabase Edge Function

```bash
# Install Supabase CLI if needed: https://supabase.com/docs/guides/cli
supabase start
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase functions serve vent-response
```

### 3. Deploy

- **Frontend** — push to GitHub and import on [Vercel](https://vercel.com). Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the Vercel environment variables.
- **Edge function** — `supabase functions deploy vent-response`

## Supported Languages

| Code | Language |
|------|----------|
| en   | English  |
| hi   | हिंदी    |
| ta   | தமிழ்    |
| te   | తెలుగు   |
