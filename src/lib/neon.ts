import { neon } from '@neondatabase/serverless'

// Singleton Neon HTTP client — reused across server requests
const sql = neon(process.env.DATABASE_URL!)

export default sql
