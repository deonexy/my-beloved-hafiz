/**
 * POST /api/verify-ayat
 * Body: { surahNumber, ayatNumber, userInput, mode }
 * Uses Claude to semantically verify the user's hafalan input.
 */

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { surahNumber, ayatNumber, correctArabic, userInput, mode } =
    await req.json()

  if (!correctArabic || !userInput) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const prompt =
    mode === 'tulis'
      ? `Kamu adalah penguji hafalan Quran yang adil dan sabar.
Ayat yang benar (surah ${surahNumber}:${ayatNumber}):
"${correctArabic}"

Jawaban pengguna:
"${userInput}"

Nilai hafalannya: apakah haruf, harakat, dan kata sudah benar?
Jawab singkat: BENAR / HAMPIR / SALAH — dan satu kalimat penjelasan dalam bahasa Indonesia.`
      : `Ayat ${surahNumber}:${ayatNumber}: "${correctArabic}"
Terjemahan pengguna: "${userInput}"
Apakah terjemahan ini mencakup makna utama ayat? BENAR / HAMPIR / SALAH — satu kalimat.`

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-5-5',
      max_tokens: 150,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const result: 'BENAR' | 'HAMPIR' | 'SALAH' =
      text.startsWith('BENAR')  ? 'BENAR'  :
      text.startsWith('HAMPIR') ? 'HAMPIR' : 'SALAH'

    return NextResponse.json({ result, explanation: text })
  } catch (err) {
    return NextResponse.json({ error: 'AI error' }, { status: 500 })
  }
}
