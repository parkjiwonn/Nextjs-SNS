import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { db } from "@/lib/db/index";
import { posts } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { ROUTES } from "@/constants";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  console.log(session);
  if (!session) {
    redirect(ROUTES.SIGNIN);
  }

  // 모든 게시글 조회 (최신순)
  const allPosts = await db.query.posts.findMany({
    orderBy: [desc(posts.createdAt)],
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar session={session} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt="Profile"
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                  {session.user?.name?.[0]}
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold">{session.user?.name}</h2>
                <p className="text-gray-600">@{session.user?.username}</p>
              </div>
            </div>
          </div>

          {/* 통계 */}
          <div className="flex gap-6 mt-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{allPosts.filter(p => p.userId === session.user.id).length}</p>
              <p className="text-sm text-gray-600">게시글</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-600">팔로워</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-600">팔로잉</p>
            </div>
          </div>
        </div>

        {/* 게시글 작성 버튼 */}
        <div className="mb-6 flex justify-end">
          <Link
            href={ROUTES.POSTS.NEW}
            className="bg-blue-400 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            + 게시글 작성
          </Link>
        </div>

        {/* 피드 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-bold mb-4">피드</h3>

          {allPosts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">아직 게시글이 없습니다</p>
          ) : (
            <div className="space-y-4">
              {allPosts.map((post) => (
                <div key={post.id} className="border-b pb-4 last:border-b-0">
                  <p className="text-gray-800 mb-2">{post.content}</p>

                  {/* 이미지가 있으면 표시 */}
                  {post.images && post.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {post.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`post image ${idx + 1}`}
                          className="rounded-lg w-full h-48 object-cover"
                        />
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(post.createdAt).toLocaleString('ko-KR')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}