import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // This is a mock implementation
        // In a real app, you would verify credentials against your database

        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Mock users for testing
        const users = [
          {
            id: "1",
            name: "Admin User",
            email: "admin@example.com",
            role: "admin",
            image: "/placeholder.svg?height=40&width=40",
          },
          {
            id: "2",
            name: "Moderator User",
            email: "moderator@example.com",
            role: "moderator",
            image: "/placeholder.svg?height=40&width=40",
          },
          {
            id: "3",
            name: "Regular User",
            email: "user@example.com",
            role: "user",
            image: "/placeholder.svg?height=40&width=40",
          },
        ]

        // Find user by email
        const user = users.find((user) => user.email === credentials.email)

        // In a real app, you would verify the password here
        // For this mock, we'll just check if the email exists

        if (user) {
          return user
        }

        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Add role to token if user is defined
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      // Add role to session
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.JWT_SECRET,
}

