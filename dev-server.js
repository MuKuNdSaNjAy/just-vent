const http  = require('http')
const https = require('https')
const fs    = require('fs')
const path  = require('path')

fs.readFileSync(path.join(__dirname, 'functions', '.env'), 'utf8')
  .split('\n').forEach((line) => {
    const [key, ...rest] = line.split('=')
    if (key && key.trim()) process.env[key.trim()] = rest.join('=').trim()
  })

const PROMPTS = {
  listen: `You are a warm, non-judgmental presence — here only to listen and make the user feel heard.
Never give advice, suggest solutions, or ask probing questions.
Reflect feelings back, validate emotions, and hold space.
Keep responses to 2-4 sentences. Stay warm and human, never clinical.
Match the language the user writes in.
End with a single open, gentle reflection — not a direct question.
Examples: "Take all the time you need.", "I'm right here.", "It makes sense you feel that way."`,

  warm: `You are an extremely warm, nurturing presence — like a trusted friend who deeply cares.
Your responses are emotionally rich, tender, and affirming.
You never give advice. You pour warmth into every word.
Keep responses to 3-5 sentences. Match the user's language.
End with something that makes them feel genuinely held and not alone.`,

  perspective: `You are a compassionate listener who also gently offers perspective when asked.
First, deeply validate the user's feelings. Then, offer a gentle, non-preachy observation.
Never tell the user what to do. Speak softly, not like a therapist.
Keep responses to 4-6 sentences. Match the user's language.`,

  closing: `The user has finished their venting session. Give a warm, brief closing message.
Acknowledge the courage it took to express themselves.
Leave them with a sense of calm and self-compassion.
2-3 sentences only. Match the user's language.`,
}

function buildMessages(messages, mood, tone) {
  // Filter out special control messages
  const filtered = messages.filter(
    (m) => m.text !== '__advice_request__' && m.text !== '__session_end__'
  )

  // For advice_request, replace with a natural user message
  const formatted = messages.map((m) => {
    if (m.text === '__advice_request__') {
      return { role: 'user', content: 'I would like to hear your thoughts and perspective on this.' }
    }
    if (m.text === '__session_end__') {
      return { role: 'user', content: "I'm done for now. Thank you for listening." }
    }
    return { role: m.role === 'ai' ? 'assistant' : 'user', content: m.text }
  })

  // Prepend mood only on the very first user message
  if (mood && formatted.length > 0 && formatted[0].role === 'user') {
    formatted[0] = { ...formatted[0], content: `[User is feeling: ${mood}]\n\n${formatted[0].content}` }
  }

  return formatted
}

function callAnthropic(messages, mood, tone) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model:      'claude-sonnet-4-6',
      max_tokens: 300,
      system:     PROMPTS[tone] ?? PROMPTS.listen,
      messages:   buildMessages(messages, mood, tone),
    })

    const req = https.request({
      hostname: 'api.anthropic.com',
      path:     '/v1/messages',
      method:   'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length':    Buffer.byteLength(body),
      },
    }, (res) => {
      let data = ''
      res.on('data', (c) => { data += c })
      res.on('end', () => {
        try {
          const p = JSON.parse(data)
          if (p.error) reject(new Error(p.error.message))
          else resolve(p.content[0].text)
        } catch (e) { reject(e) }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

// ── Whisper transcription ────────────────────────────────────────────────────
function callWhisper(base64Audio, language) {
  return new Promise((resolve, reject) => {
    if (!process.env.OPENAI_API_KEY) {
      return reject(new Error('OPENAI_API_KEY not set. Add it to functions/.env'))
    }

    const audioBuffer = Buffer.from(base64Audio, 'base64')
    const boundary    = 'WBoundary' + Math.random().toString(36).slice(2)

    const textParts = [
      `--${boundary}\r\n`,
      `Content-Disposition: form-data; name="model"\r\n\r\n`,
      `whisper-1\r\n`,
      ...(language && language !== 'en' ? [
        `--${boundary}\r\n`,
        `Content-Disposition: form-data; name="language"\r\n\r\n`,
        `${language}\r\n`,
      ] : []),
      `--${boundary}\r\n`,
      `Content-Disposition: form-data; name="file"; filename="audio.webm"\r\n`,
      `Content-Type: audio/webm\r\n\r\n`,
    ]

    const header  = Buffer.from(textParts.join(''))
    const trailer = Buffer.from(`\r\n--${boundary}--\r\n`)
    const body    = Buffer.concat([header, audioBuffer, trailer])

    const req = https.request({
      hostname: 'api.openai.com',
      path:     '/v1/audio/transcriptions',
      method:   'POST',
      headers: {
        'Authorization':  `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type':   `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
      },
    }, (res) => {
      let data = ''
      res.on('data', (c) => { data += c })
      res.on('end', () => {
        try {
          const p = JSON.parse(data)
          if (p.error) reject(new Error(p.error.message))
          else resolve(p.text)
        } catch (e) { reject(e) }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

// ── HTTP server ───────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return }
  if (req.method !== 'POST')    { res.writeHead(404); res.end(); return }

  let body = ''
  req.on('data', (c) => { body += c })
  req.on('end', async () => {
    try {
      if (req.url === '/vent') {
        const { messages, mood, tone } = JSON.parse(body)
        const response = await callAnthropic(messages, mood ?? null, tone ?? 'listen')
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ response }))

      } else if (req.url === '/transcribe') {
        const { audio, language } = JSON.parse(body)
        const transcript = await callWhisper(audio, language ?? 'en')
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ transcript }))

      } else {
        res.writeHead(404); res.end()
      }
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: err.message }))
    }
  })
})

server.listen(3001, () => console.log('Dev server at http://localhost:3001'))
