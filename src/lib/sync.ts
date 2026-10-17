'use client'

import { db } from './db'

let flushing = false

export async function flushSyncOutbox() {
  if (flushing || typeof window === 'undefined') return
  flushing = true

  try {
    const pending = await db.syncOutbox
      .where('attempts').below(5)
      .toArray()

    if (pending.length === 0) return

    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: pending }),
    })

    if (!res.ok) return

    const { results } = await res.json() as {
      results: { id: string; ok: boolean }[]
    }

    for (const r of results) {
      if (r.ok) {
        await db.syncOutbox.where('id').equals(Number(r.id)).delete()
      } else {
        await db.syncOutbox.where('id').equals(Number(r.id)).modify(item => {
          item.attempts = (item.attempts ?? 0) + 1
        })
      }
    }
  } catch {
    // Offline — will retry on next 'online' event
  } finally {
    flushing = false
  }
}

// Auto-flush when device comes back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => flushSyncOutbox())
}
