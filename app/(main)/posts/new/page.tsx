import Link from "next/link";
import { PostForm } from "@/app/(main)/create/_components/PostForm";
import { ROUTES } from "@/constants";

export default function CreatePostPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">게시글 작성</h1>
          <Link href={ROUTES.HOME} className="text-gray-600 hover:text-gray-800">
            ✕
          </Link>
        </div>

        <PostForm />
      </div>
    </div>
  );
}