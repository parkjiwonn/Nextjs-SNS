import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { db } from "@/lib/db/index";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // 👇 로그 추가
        console.log('\n========== AUTHORIZE 시작 ==========');
        console.log('📥 받은 credentials:', {
          email: credentials?.email,
          password: credentials?.password ? '***' : undefined,
          passwordLength: credentials?.password?.length
        });

        if (!credentials?.email || !credentials?.password) {
          console.log('❌ 이메일 또는 비밀번호 누락');
          console.log('========== AUTHORIZE 종료 (null) ==========\n');
          return null;
        }

        console.log('🔍 DB 조회 시작:', credentials.email);

        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email)
        });

        console.log('📦 DB 조회 결과:', user ? {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          hasPassword: !!user.password,
          passwordStart: user.password?.substring(0, 20) + '...'
        } : '사용자 없음');

        if (!user || !user.password) {
          console.log('❌ 사용자 없거나 비밀번호 없음');
          console.log('========== AUTHORIZE 종료 (null) ==========\n');
          return null;
        }

        console.log('🔐 비밀번호 검증 시작...');
        console.log('입력 비밀번호:', credentials.password);
        console.log('DB 해시 (전체):', user.password);

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        console.log('비밀번호 검증 결과:', isPasswordValid ? '✅ 성공' : '❌ 실패');

        if (!isPasswordValid) {
          console.log('❌ 비밀번호 불일치');
          console.log('========== AUTHORIZE 종료 (null) ==========\n');
          return null;
        }

        const result = {
          id: user.id.toString(), // 👈 string 변환 추가
          email: user.email,
          name: user.name,
          username: user.username,
          image: user.profileImage || undefined
        };

        console.log('✅ 인증 성공!');
        console.log('반환 객체:', result);
        console.log('========== AUTHORIZE 종료 (user) ==========\n');

        return result;
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      console.log('\n========== SIGNIN CALLBACK ==========');
      console.log('Provider:', account?.provider);
      console.log('User:', user);
      
      if (account?.provider === "google") {
        const existingUser = await db.query.users.findFirst({
          where: eq(users.email, user.email!)
        });

        if (!existingUser) {
          await db.insert(users).values({
            email: user.email!,
            name: user.name!,
            username: user.email!.split("@")[0],
            profileImage: user.image || null,
            password: null,
          });
        }
      }
      
      console.log('SignIn callback returning: true');
      console.log('========== SIGNIN CALLBACK 종료 ==========\n');
      return true;
    },
    async jwt({ token, user }) {
      console.log('\n========== JWT CALLBACK ==========');
      console.log('Token (before):', token);
      console.log('User:', user);
      
      if (user) { 
        token.id = user.id;
        token.username = user.username;
      }
      
      console.log('Token (after):', token);
      console.log('========== JWT CALLBACK 종료 ==========\n');
      return token;
    },
    async session({ session, token }) {
      console.log('\n========== SESSION CALLBACK ==========');
      console.log('Session (before):', session);
      console.log('Token:', token);
      
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
      }
      
      console.log('Session (after):', session);
      console.log('========== SESSION CALLBACK 종료 ==========\n');
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt"
  },
};