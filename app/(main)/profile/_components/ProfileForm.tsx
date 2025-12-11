"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Alert } from "@/components/ui/Alert";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useProfile } from "@/hooks/useProfile";

export function ProfileForm() {
  const { profile, loading, updating, error, updateProfile } = useProfile();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 프로필 데이터 로드 시 폼 초기화
  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setBio(profile.bio || "");
      setPreviewUrl(profile.profileImage);
    }
  }, [profile]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("파일 크기는 5MB 이하여야 합니다");
      return;
    }

    // 이미지 파일 검증
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다");
      return;
    }

    setProfileImage(file);

    // 미리보기 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("bio", bio);
    if (profileImage) {
      formData.append("profileImage", profileImage);
    }

    const result = await updateProfile(formData);

    if (result.success) {
      setSuccessMessage("프로필이 성공적으로 업데이트되었습니다!");
      setProfileImage(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <Alert variant="error">
        프로필을 불러올 수 없습니다
      </Alert>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">프로필 수정</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {successMessage && <Alert variant="success">{successMessage}</Alert>}
        {error && <Alert variant="error">{error}</Alert>}

        {/* 프로필 이미지 */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-200">
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="Profile"
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl font-bold">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />

          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            프로필 이미지 변경
          </Button>

          {profileImage && (
            <p className="text-sm text-gray-600">
              선택된 파일: {profileImage.name}
            </p>
          )}
        </div>

        {/* 이메일 (읽기 전용) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이메일
          </label>
          <input
            type="email"
            value={profile.email}
            disabled
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
          />
        </div>

        {/* 유저네임 (읽기 전용) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            유저네임
          </label>
          <div className="flex items-center w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
            <span className="text-gray-400 mr-1">@</span>
            {profile.username}
          </div>
        </div>

        {/* 이름 */}
        <Input
          label="이름"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름을 입력하세요"
        />

        {/* Bio */}
        <div>
          <label
            htmlFor="bio"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            소개
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
            placeholder="자기소개를 입력하세요"
          />
        </div>

        <Button type="submit" isLoading={updating}>
          프로필 저장
        </Button>
      </form>
    </div>
  );
}
