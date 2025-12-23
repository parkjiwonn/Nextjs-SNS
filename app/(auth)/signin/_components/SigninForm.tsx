"use client";

import Link from "next/link";
import { Alert } from "@/components/ui/Alert";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useSignin } from "@/hooks/auth/useSignin";
import { ROUTES } from "@/constants";

interface SigninFormProps {
  showSignupSuccess?: boolean;
}

export function SigninForm({ showSignupSuccess = false }: SigninFormProps) {
  const { email, setEmail, password, setPassword, error, loading, handleSubmit } = useSignin();

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">SNS</h1>
        <p className="mt-6 text-gray-600">다시 만나서 반가워요!</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {showSignupSuccess && (
          <Alert variant="success">
            회원가입이 완료되었습니다! 로그인해주세요.
          </Alert>
        )}

        {error && <Alert variant="error">{error}</Alert>}

        <Input
          label="이메일"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@email.com"
        />

        <Input
          label="비밀번호"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        <Button type="submit" isLoading={loading}>
          로그인
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          계정이 없으신가요?{" "}
          <Link
            href={ROUTES.SIGNUP}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
