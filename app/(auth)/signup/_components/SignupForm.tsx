"use client";

import Link from "next/link";
import { Alert } from "@/components/ui/Alert";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useSignup } from "@/hooks/auth/useSignup";

export function SignupForm() {
  const { formData, error, loading, handleChange, handleSubmit } = useSignup();

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">SNS</h1>
        <p className="mt-2 text-gray-600">새로운 계정 만들기</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <Alert variant="error">{error}</Alert>}

        <Input
          label="이름"
          type="text"
          required
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="홍길동"
        />

        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
             유저네임
          </label>
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-gray-400">@</span>
            <input
              id="username"
              type="text"
              required
              value={formData.username}
              onChange={(e) => handleChange("username", e.target.value)}
              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="username123"
            />
          </div>
        </div>

        <Input
          label="이메일"
          type="email"
          required
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          placeholder="example@email.com"
        />

        <Input
          label="비밀번호"
          type="password"
          required
          value={formData.password}
          onChange={(e) => handleChange("password", e.target.value)}
          placeholder="8자 이상"
        />

        <Button type="submit" isLoading={loading}>
        {loading ? "처리 중..." : "가입하기"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
         
          <Link
            href="/signin"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
