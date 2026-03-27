// ─── AI Router ───────────────────────────────────────────────────────────────
// Text:   Claude API (Sonnet 4.6) OR OpenRouter free models (DeepSeek V3, Llama)
// Images: OpenRouter — single key, per-image billing, 6 models
// Video:  FAL.ai — Kling 3.0 — only option (OR has no video generation yet)
// ─────────────────────────────────────────────────────────────────────────────

const CLAUDE_BASE     = 'https://api.anthropic.com/v1/messages'
const OPENROUTER_BASE = 'https://openrouter.ai/api/v1'

// Keys are stored in localStorage by ApiKeySetup component
function getKey(name: 'sre_claude_key' | 'sre_or_key' | 'sre_fal_key'): string {
  return typeof window !== 'undefined' ? (localStorage.getItem(name) || '') : ''
}

export type TextModel = 'claude-sonnet' | 'openrouter-free' | 'openrouter-cheap'

// ─── Streaming text (scripts, hooks, captions) ────────────────────────────────
export async function streamText(
  prompt: string,
  onChunk: (t: string) => void,
  model: TextModel = 'claude-sonnet'
) {
  if (model === 'claude-sonnet') {
    const key = getKey('sre_claude_key')
    if (!key) throw new Error('Claude API key not set. Click ⚙ API Keys to add it.')

    const res = await fetch(CLAUDE_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        stream: true,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    if (!res.ok) throw new Error(`Claude API error ${res.status}`)

    const reader = res.body!.getReader()
    const decoder = new TextDecoder()
    let buf = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buf += decoder.decode(value, { stream: true })
      const lines = buf.split('\n'); buf = lines.pop()!
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const d = JSON.parse(line.slice(6))
            if (d.type === 'content_block_delta' && d.delta?.text) onChunk(d.delta.text)
          } catch { /* partial JSON */ }
        }
      }
    }

  } else {
    const key = getKey('sre_or_key')
    if (!key) throw new Error('OpenRouter API key not set. Click ⚙ API Keys to add it.')

    const modelId = model === 'openrouter-free'
      ? 'deepseek/deepseek-chat-v3-0324:free'    // DeepSeek V3 — free tier
      : 'meta-llama/llama-3.3-70b-instruct:free' // Llama 3.3 70B — free tier

    const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
        'HTTP-Referer': 'https://socialrevenueengine.app',
        'X-Title': 'Social Revenue Engine'
      },
      body: JSON.stringify({
        model: modelId,
        stream: true,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    if (!res.ok) throw new Error(`OpenRouter error ${res.status}`)

    const reader = res.body!.getReader()
    const decoder = new TextDecoder()
    let buf = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buf += decoder.decode(value, { stream: true })
      const lines = buf.split('\n'); buf = lines.pop()!
      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const d = JSON.parse(line.slice(6))
            const t = d.choices?.[0]?.delta?.content
            if (t) onChunk(t)
          } catch { /* partial JSON */ }
        }
      }
    }
  }
}

// ─── Non-streaming text (JSON responses) ─────────────────────────────────────
export async function generateText(prompt: string, model: TextModel = 'claude-sonnet'): Promise<string> {
  if (model === 'claude-sonnet') {
    const key = getKey('sre_claude_key')
    if (!key) throw new Error('Claude API key not set.')

    const res = await fetch(CLAUDE_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    })
    if (!res.ok) throw new Error(`Claude API error ${res.status}`)
    const data = await res.json()
    return data.content?.[0]?.text || ''

  } else {
    const key = getKey('sre_or_key')
    if (!key) throw new Error('OpenRouter API key not set.')

    const modelId = model === 'openrouter-free'
      ? 'deepseek/deepseek-chat-v3-0324:free'
      : 'meta-llama/llama-3.3-70b-instruct:free'

    const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
        'HTTP-Referer': 'https://socialrevenueengine.app',
        'X-Title': 'Social Revenue Engine'
      },
      body: JSON.stringify({ model: modelId, messages: [{ role: 'user', content: prompt }] })
    })
    if (!res.ok) throw new Error(`OpenRouter error ${res.status}`)
    const data = await res.json()
    return data.choices?.[0]?.message?.content || ''
  }
}

// ─── Image generation via OpenRouter ─────────────────────────────────────────
export type ImageModel =
  | 'nano-banana'       // google/gemini-2.5-flash-image        ~$0.003  ← default
  | 'nano-banana-2'     // google/gemini-3.1-flash-image-preview ~$0.006
  | 'riverflow-fast'    // sourceful/riverflow-v2-fast            $0.02   ← text in images
  | 'riverflow-pro'     // sourceful/riverflow-v2-pro             $0.15   ← premium
  | 'seedream'          // bytedance-seed/seedream-4.5            $0.04   ← portraits
  | 'flux-klein'        // black-forest-labs/flux.2-klein-4b      $0.014

export const IMAGE_MODELS: Record<ImageModel, {
  id: string; label: string; cost: string; bestFor: string; badge: string
}> = {
  'nano-banana':    { id: 'google/gemini-2.5-flash-image',              label: 'Nano Banana',    cost: '~$0.003', bestFor: 'Social posts, quick edits',        badge: 'CHEAPEST' },
  'nano-banana-2':  { id: 'google/gemini-3.1-flash-image-preview',      label: 'Nano Banana 2',  cost: '~$0.006', bestFor: 'Better quality, Pro-level speed',   badge: 'BALANCED' },
  'riverflow-fast': { id: 'sourceful/riverflow-v2-fast',                label: 'Riverflow Fast', cost: '$0.02',   bestFor: 'Text overlays, carousels',           badge: 'TEXT' },
  'riverflow-pro':  { id: 'sourceful/riverflow-v2-pro',                 label: 'Riverflow Pro',  cost: '$0.15',   bestFor: 'Perfect text, premium output',        badge: 'PREMIUM' },
  'seedream':       { id: 'bytedance-seed/seedream-4.5',                label: 'Seedream 4.5',   cost: '$0.04',   bestFor: 'Portraits, faces, social aesthetic',  badge: 'FACES' },
  'flux-klein':     { id: 'black-forest-labs/flux.2-klein-4b',          label: 'FLUX.2 Klein',   cost: '$0.014',  bestFor: 'High-throughput, photorealistic',      badge: 'FAST' },
}

export async function generateImage(
  prompt: string,
  model: ImageModel = 'nano-banana',
  aspectRatio: '1:1' | '9:16' | '16:9' | '4:5' = '1:1'
): Promise<string> {
  const key = getKey('sre_or_key')
  if (!key) throw new Error('OpenRouter API key not set. Click ⚙ API Keys to add it.')

  const modelInfo = IMAGE_MODELS[model]
  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
      'HTTP-Referer': 'https://socialrevenueengine.app',
      'X-Title': 'Social Revenue Engine'
    },
    body: JSON.stringify({
      model: modelInfo.id,
      messages: [{ role: 'user', content: prompt }],
      modalities: ['image'],
      image_config: { aspect_ratio: aspectRatio }
    })
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: { message?: string } }).error?.message || `OpenRouter error ${res.status}`)
  }

  const data = await res.json()
  const imgData = data.choices?.[0]?.message?.images?.[0]
  if (imgData) return imgData
  const content = data.choices?.[0]?.message?.content
  if (typeof content === 'string' && content.startsWith('data:')) return content
  throw new Error('No image returned. Model may not support this modality.')
}
