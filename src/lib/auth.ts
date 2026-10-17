import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import sql from '@/lib/neon'

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/masuk',
    newUser: '/daftar',
    error: '/masuk',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const rows = await sql`
          SELECT id, name, email, password_hash
          FROM users
          WHERE email = ${credentials.email as string}
          LIMIT 1
        `
        const user = rows[0]
        if (!user) return null

        const valid = await compare(credentials.password as string, user.password_hash as string)
        if (!valid) return null

        return { id: user.id as string, name: user.name as string, email: user.email as string }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      if (token?.id) session.user.id = token.id as string
      return session
    },
  },
})
