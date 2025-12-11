import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { uploadImageFromBuffer } from "@/lib/storage/supabase";

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: 게시글 작성
 *     description: 새로운 게시글을 작성하고 이미지를 업로드합니다 (로그인 필요)
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: 게시글 내용
 *                 example: 오늘 날씨가 좋네요!
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: 업로드할 이미지 파일들 (최대 5MB, 이미지 파일만 가능)
 *     responses:
 *       201:
 *         description: 게시글 작성 완료
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 게시글 작성 완료
 *                 postId:
 *                   type: string
 *       400:
 *         description: 잘못된 요청 (내용 누락, 파일 크기 초과 등)
 *       401:
 *         description: 인증 필요 (로그인 필요)
 *       500:
 *         description: 서버 오류
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const content = formData.get("content") as string;
    const imageFiles = formData.getAll("images") as File[];

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "내용을 입력해주세요" },
        { status: 400 }
      );
    }

    // Supabase Storage에 이미지 업로드
    const imageUrls: string[] = [];

    for (const file of imageFiles) {
      if (file && file.size > 0) {
        // 파일 검증
        if (file.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            { error: "이미지는 5MB 이하만 가능합니다" },
            { status: 400 }
          );
        }

        if (!file.type.startsWith("image/")) {
          return NextResponse.json(
            { error: "이미지 파일만 업로드 가능합니다" },
            { status: 400 }
          );
        }

        try {
          const buffer = Buffer.from(await file.arrayBuffer());
          const imageUrl = await uploadImageFromBuffer(
            buffer,
            file.name,
            file.type
          );
          imageUrls.push(imageUrl);
        } catch (uploadError) {
          console.error("Image upload error:", uploadError);
          return NextResponse.json(
            { error: "이미지 업로드 실패" },
            { status: 500 }
          );
        }
      }
    }

    const postId = crypto.randomUUID();

    await db.insert(posts).values({
      id: postId,
      userId: session.user.id,
      content: content.trim(),
      images: imageUrls.length > 0 ? imageUrls : null,
    });

    return NextResponse.json(
      { message: "게시글 작성 완료", postId, imageUrls },
      { status: 201 }
    );
  } catch (error) {
    console.error("Post creation error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
