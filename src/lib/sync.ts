/**
 * Outbox sync — flushes pending local writes to Supabase.
 * Called when online status changes or after a session completes.
 */

import { getDB } from './db'
import { getSupabaseClient } from './supabase/client'

export async function flushSyncOutbox(): Promise<{ synced: number; failed: number }> {
  if (typeof window === 'undefined') return { synced: 0, failed: 0 }
  if (!navigator.onLine) return { synced: 0, failed: 0 }

  const db = getDB()
  const supabase = getSupabaseClient()

  const pending = await db.syncOutbox.orderBy('createdAt').limit(50).toArray()
  let synced = 0
  let failed = 0

  for (const item of pending) {
    try {
      const { error } = item.operation === 'insert'
        ? await supabase.from(item.tableName).upsert(item.payload as Record<string, unknown>)
        : await supabase.from(item.tableName).upsert(item.payload as Record<string, unknown>)

      if (error) throw error

      await db.syncOutbox.delete(item.id!)
      synced++
    } catch {
      await db.syncOutbox.update(item.id!, { attempts: item.attempts + 1 })
      failed++
    }
  }

  return { synced, failed }
}

// Auto-sync on reconnect
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => flushSyncOutbox())
}
