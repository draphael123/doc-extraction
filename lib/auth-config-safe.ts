import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GithubProvider from 'next-auth/providers/github'
import EmailProvider from 'next-auth/providers/email'
import { prisma } from '@/lib/prisma'

function validateAuthConfig() {
  const requiredEnvVars = {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  }

  const missing: string[] = []
  
  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value) {
      missing.push(key)
    }
  }

  if (missing.length > 0) {
    console.error('Missing required NextAuth environment variables:', missing.join(', '))
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  return true
}

export const authOptions: NextAuthOptions = (() => {
  try {
    validateAuthConfig()
    
    return {
      adapter: PrismaAdapter(prisma) as any,
      providers: [
        GithubProvider({
          clientId: process.env.GITHUB_CLIENT_ID || '',
          clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
        }),
        EmailProvider({
          server: process.env.EMAIL_SERVER || {
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASSWORD,
            },
          },
          from: process.env.EMAIL_FROM || 'noreply@example.com',
        }),
      ],
      session: {
        strategy: 'jwt',
      },
      pages: {
        signIn: '/auth/signin',
      },
      callbacks: {
        async session({ session, token }) {
          if (session.user) {
            session.user.id = token.sub as string
          }
          return session
        },
        async jwt({ token, user }) {
          if (user) {
            token.sub = user.id
          }
          return token
        },
      },
    }
  } catch (error) {
    console.error('Error initializing auth config:', error)
    throw error
  }
})()
