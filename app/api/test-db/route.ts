import { NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { users } from "@/lib/db/schema";

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
