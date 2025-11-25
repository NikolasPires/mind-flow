import NextAuth, { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const response = await fetch(`${process.env.DB_HOST}/signIn`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });
        if (response.ok) {
      const userData = await response.json();

      return userData;
    } 

        const user = await response.json();

        if (response.ok && user) {
          return user;
        }
      
        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};

export default NextAuth(authOptions);