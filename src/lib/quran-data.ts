/**
 * Minimal Surah metadata — embedded, no API call needed.
 * Actual ayat text fetched from open Quran API (quran.com API v4).
 */

import type { Surah } from '@/types'

export const SURAH_LIST: Surah[] = [
  { number: 1,   name: 'الفاتحة',       nameId: 'Al-Fatihah',      totalAyat: 7,   juz: [1],  revelation: 'Makkiyyah' },
  { number: 2,   name: 'البقرة',        nameId: 'Al-Baqarah',      totalAyat: 286, juz: [1,2,3], revelation: 'Madaniyyah' },
  { number: 36,  name: 'يس',            nameId: 'Ya-Sin',          totalAyat: 83,  juz: [22,23], revelation: 'Makkiyyah' },
  { number: 55,  name: 'الرحمن',        nameId: 'Ar-Rahman',       totalAyat: 78,  juz: [27], revelation: 'Madaniyyah' },
  { number: 67,  name: 'الملك',         nameId: 'Al-Mulk',         totalAyat: 30,  juz: [29], revelation: 'Makkiyyah' },
  { number: 78,  name: 'النبأ',          nameId: "An-Naba'",        totalAyat: 40,  juz: [30], revelation: 'Makkiyyah' },
  { number: 79,  name: 'النازعات',       nameId: "An-Nazi'at",      totalAyat: 46,  juz: [30], revelation: 'Makkiyyah' },
  { number: 80,  name: 'عبس',           nameId: "'Abasa",           totalAyat: 42,  juz: [30], revelation: 'Makkiyyah' },
  { number: 112, name: 'الإخلاص',       nameId: 'Al-Ikhlas',       totalAyat: 4,   juz: [30], revelation: 'Makkiyyah' },
  { number: 113, name: 'الفلق',         nameId: 'Al-Falaq',        totalAyat: 5,   juz: [30], revelation: 'Makkiyyah' },
  { number: 114, name: 'الناس',         nameId: 'An-Nas',          totalAyat: 6,   juz: [30], revelation: 'Makkiyyah' },
]

// Full list will load from quran.com API — this is the starter seed

/**
 * Fetch ayat text from quran.com (free, no key required)
 * Returns arabic + translation (id) + transliteration
 */
export async function fetchAyat(surahNumber: number, ayatNumber: number) {
  const res = await fetch(
    `https://api.quran.com/api/v4/verses/by_key/${surahNumber}:${ayatNumber}` +
    `?language=id&words=true&translations=33&fields=text_uthmani`,
    { next: { revalidate: 86400 } }, // cache 24h
  )
  if (!res.ok) throw new Error(`Quran API error: ${res.status}`)
  const data = await res.json()
  return data.verse
}

export async function fetchSurahVerses(surahNumber: number) {
  const res = await fetch(
    `https://api.quran.com/api/v4/verses/by_chapter/${surahNumber}` +
    `?language=id&words=true&translations=33&fields=text_uthmani&per_page=300`,
    { next: { revalidate: 86400 } },
  )
  if (!res.ok) throw new Error(`Quran API error: ${res.status}`)
  const data = await res.json()
  return data.verses
}

export async function fetchAllSurahs(): Promise<Surah[]> {
  const res = await fetch(
    'https://api.quran.com/api/v4/chapters?language=id',
    { next: { revalidate: 86400 * 7 } },
  )
  if (!res.ok) return SURAH_LIST
  const data = await res.json()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.chapters.map((c: any): Surah => ({
    number: c.id,
    name: c.name_arabic,
    nameId: c.name_simple,
    totalAyat: c.verses_count,
    juz: [], // populate from separate endpoint if needed
    revelation: c.revelation_place === 'makkah' ? 'Makkiyyah' : 'Madaniyyah',
  }))
}
