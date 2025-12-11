"use client";

import { SignupForm } from "./_components/SignupForm";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full">
        <SignupForm />
      </div>
    </div>
  );
}