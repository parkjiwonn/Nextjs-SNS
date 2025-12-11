import { NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: 회원가입
 *     description: 새로운 사용자를 등록합니다
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - username
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               username:
 *                 type: string
 *                 example: jiwon123
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *               name:
 *                 type: string
 *                 example: 박지원
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 회원가입 성공
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     username:
 *                       type: string
 *                     name:
 *                       type: string
 *       400:
 *         description: 잘못된 요청 (필수 필드 누락 또는 중복된 이메일/유저네임)
 *       500:
 *         description: 서버 오류
 */
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