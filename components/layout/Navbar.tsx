"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Session } from "next-auth";

interface NavbarProps {
  session: Session;
}

export default function Navbar({ session }: NavbarProps) {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-blue-600">
            G1-stagram
          </Link>

          <div className="flex items-center space-x-6">
            <Link href="/" className="text-gray-700 hover:text-gray-900 font-medium">
              홈
            </Link>
            <Link href="/profile" className="text-gray-700 hover:text-gray-900 font-medium">
              설정
            </Link>
            
            <div className="flex items-center space-x-3">
              {session.user?.image && (
                <img
                  src={session.user.image}
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/signin" })}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}