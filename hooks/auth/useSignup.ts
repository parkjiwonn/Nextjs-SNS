import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * 회원가입 폼 데이터 타입
 */
interface SignupFormData {
  email: string;
  username: string;
  password: string;
  name: string;
}

/**
 * useSignup Hook
 *
 * 회원가입 페이지의 비즈니스 로직을 담당하는 Custom Hook입니다.
 * 폼 상태 관리, 유효성 검사, API 호출 등을 처리합니다.
 *
 * @example
 * const { formData, error, loading, handleChange, handleSubmit } = useSignup();
 *
 * <form onSubmit={handleSubmit}>
 *   <input
 *     value={formData.email}
 *     onChange={(e) => handleChange('email', e.target.value)}
 *   />
 * </form>
 */
export function useSignup() {
  const router = useRouter();
  const [formData, setFormData] = useState<SignupFormData>({
    email: "",
    username: "",
    password: "",
    name: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * 폼 필드 값 변경 핸들러
   * @param field - 변경할 필드명
   * @param value - 새로운 값
   */
  const handleChange = (field: keyof SignupFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * 회원가입 폼 제출 핸들러
   * @param e - Form submit event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "회원가입에 실패했습니다");
        setLoading(false);
        return;
      }

      // 회원가입 성공 시 로그인 페이지로 리다이렉트
      router.push("/signin?signup=success");
    } catch (err) {
      setError("회원가입 중 오류가 발생했습니다");
      setLoading(false);
    }
  };

  return {
    formData,
    error,
    loading,
    handleChange,
    handleSubmit,
  };
}
