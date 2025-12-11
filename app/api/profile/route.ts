import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { uploadImageFromBuffer } from "@/lib/storage/supabase";

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: 프로필 조회
 *     description: 현재 로그인한 사용자의 프로필 정보를 조회합니다
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 프로필 조회 성공
 *       401:
 *         description: 인증 필요
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  try {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        name: users.name,
        bio: users.bio,
        profileImage: users.profileImage,
      })
      .from(users)
      .where(eq(users.id, session.user.id));

    if (!user) {
      return NextResponse.json({ error: "사용자를 찾을 수 없습니다" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: "프로필 조회 실패" }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/profile:
 *   put:
 *     summary: 프로필 수정
 *     description: 사용자의 프로필 정보를 수정합니다 (이름, bio, 프로필 이미지)
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: 박지원
 *               bio:
 *                 type: string
 *                 example: 안녕하세요!
 *               profileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: 프로필 수정 성공
 *       401:
 *         description: 인증 필요
 *       500:
 *         description: 서버 오류
 */
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const bio = formData.get("bio") as string;
    const profileImageFile = formData.get("profileImage") as File | null;

    let profileImageUrl: string | undefined;

    // 프로필 이미지 업로드 처리
    if (profileImageFile && profileImageFile.size > 0) {
      // 파일 크기 검증 (5MB)
      if (profileImageFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "파일 크기는 5MB 이하여야 합니다" },
          { status: 400 }
        );
      }

      // 이미지 파일 검증
      if (!profileImageFile.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "이미지 파일만 업로드 가능합니다" },
          { status: 400 }
        );
      }

      try {
        const buffer = Buffer.from(await profileImageFile.arrayBuffer());
        profileImageUrl = await uploadImageFromBuffer(
          buffer,
          profileImageFile.name,
          profileImageFile.type,
          "profile-images"
        );
      } catch (uploadError) {
        console.error("Profile image upload error:", uploadError);
        return NextResponse.json(
          { error: "이미지 업로드 실패" },
          { status: 500 }
        );
      }
    }

    // 프로필 업데이트
    const updateData: any = {};
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio; // 빈 문자열도 허용
    if (profileImageUrl) updateData.profileImage = profileImageUrl;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "수정할 내용이 없습니다" },
        { status: 400 }
      );
    }

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, session.user.id))
      .returning({
        id: users.id,
        email: users.email,
        username: users.username,
        name: users.name,
        bio: users.bio,
        profileImage: users.profileImage,
      });

    return NextResponse.json({
      message: "프로필이 업데이트되었습니다",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "프로필 수정 실패" }, { status: 500 });
  }
}
