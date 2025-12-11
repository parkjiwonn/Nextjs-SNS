import { NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { users } from "@/lib/db/schema";

/**
 * @swagger
 * /api/test-db:
 *   get:
 *     summary: 데이터베이스 연결 테스트
 *     description: DB 연결 상태를 확인합니다
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: DB 연결 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: DB 연결 성공!
 *                 userCount:
 *                   type: number
 *                   example: 1
 *       500:
 *         description: DB 연결 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: DB 연결 실패
 *                 error:
 *                   type: string
 */
export async function GET() {
  try {
    // users 테이블 조회 시도
    const result = await db.select().from(users).limit(1);
    
    return NextResponse.json({
      success: true,
      message: "DB 연결 성공!",
      userCount: result.length
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: "DB 연결 실패",
      error: error.message
    }, { status: 500 });
  }
}
