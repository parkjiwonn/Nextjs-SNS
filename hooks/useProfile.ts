import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS, ROUTES } from "@/constants";

/**
 * 프로필 데이터 타입
 */
interface ProfileData {
  id: string;
  email: string;
  username: string;
  name: string;
  bio: string | null;
  profileImage: string | null;
}

/**
 * useProfile Hook
 *
 * 프로필 조회 및 수정 로직을 담당하는 Custom Hook입니다.
 *
 * @example
 * const { profile, loading, error, updateProfile } = useProfile();
 */
export function useProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  // 프로필 조회
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.PROFILE);

      if (!response.ok) {
        if (response.status === 401) {
          router.push(ROUTES.SIGNIN);
          return;
        }
        throw new Error("프로필 조회 실패");
      }

      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "프로필 조회 실패");
    } finally {
      setLoading(false);
    }
  };

  /**
   * 프로필 업데이트
   * @param formData - 수정할 프로필 데이터 (FormData)
   */
  const updateProfile = async (formData: FormData) => {
    setError("");
    setUpdating(true);

    try {
      const response = await fetch(API_ENDPOINTS.PROFILE, {
        method: "PUT",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "프로필 수정 실패");
      }

      setProfile(data.user);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "프로필 수정 실패";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setUpdating(false);
    }
  };

  return {
    profile,
    loading,
    updating,
    error,
    updateProfile,
    refetch: fetchProfile,
  };
}
