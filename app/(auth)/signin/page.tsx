"use client";

import { useSearchParams } from "next/navigation";
import { SigninForm } from "./_components/SigninForm";

export default function SigninPage() {
  const searchParams = useSearchParams();
  const signupSuccess = searchParams.get("signup") === "success";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full">
        <SigninForm showSignupSuccess={signupSuccess} />
      </div>
    </div>
  );
}