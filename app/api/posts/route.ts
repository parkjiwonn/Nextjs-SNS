import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

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

    // S3에 이미지 업로드
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

        const buffer = Buffer.from(await file.arrayBuffer());
        const key = `posts/${Date.now()}-${crypto.randomUUID()}-${file.name}`;

        await s3.send(
          new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: key,
            Body: buffer,
            ContentType: file.type,
          })
        );

        const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
        imageUrls.push(url);
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
      { message: "게시글 작성 완료", postId },
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