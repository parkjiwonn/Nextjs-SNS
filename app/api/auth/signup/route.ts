import { NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, username, password, name } = await request.json();

    if (!email || !username || !password || !name) {
      return NextResponse.json(
        { error: "모든 필드를 입력해주세요" },
        { status: 400 }
      );
    }

    const existingUserByEmail = await db.query.users.findFirst({
      where: eq(users.email, email)
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        { error: "이미 사용 중인 이메일입니다" },
        { status: 400 }
      );
    }

    const existingUserByUsername = await db.query.users.findFirst({
      where: eq(users.username, username)
    });

    if (existingUserByUsername) {
      return NextResponse.json(
        { error: "이미 사용 중인 유저네임입니다" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();

    await db.insert(users).values({
      id: userId,
      email,
      username,
      password: hashedPassword,
      name
    });

    return NextResponse.json(
      { 
        message: "회원가입 성공",
        user: {
          id: userId,
          email,
          username,
          name
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}