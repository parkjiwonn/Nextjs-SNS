import { forwardRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Input 컴포넌트의 Props
 * HTML input 엘리먼트의 모든 속성을 상속받습니다.
 */
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Input 상단에 표시될 라벨 텍스트 (선택사항) */
  label?: string;
  /** Input 하단에 표시될 에러 메시지 (선택사항) */
  error?: string;
}

/**
 * Input 컴포넌트
 *
 * 재사용 가능한 폼 입력 컴포넌트입니다.
 * 라벨, 에러 메시지 표시, ref 전달을 지원하며, HTML input의 모든 속성을 사용할 수 있습니다.
 *
 * @component
 * @example
 * // 기본 사용
 * <Input
 *   label="이메일"
 *   type="email"
 *   placeholder="example@email.com"
 *   required
 * />
 *
 * @example
 * // 에러 메시지와 함께 사용
 * <Input
 *   label="비밀번호"
 *   type="password"
 *   error="비밀번호는 8자 이상이어야 합니다"
 * />
 *
 * @example
 * // ref를 사용한 제어
 * const inputRef = useRef<HTMLInputElement>(null);
 * <Input
 *   ref={inputRef}
 *   label="사용자 이름"
 *   defaultValue="jiwon"
 * />
 *
 * @example
 * // 상태 관리와 함께 사용
 * const [email, setEmail] = useState("");
 * <Input
 *   label="이메일"
 *   type="email"
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 * />
 *
 * @example
 * // disabled 상태
 * <Input
 *   label="읽기 전용"
 *   value="수정 불가"
 *   disabled
 * />
 *
 * @example
 * // 커스텀 스타일 추가
 * <Input
 *   label="이름"
 *   className="mb-4"
 * />
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "w-full px-4 py-3 border border-gray-300 rounded-lg",
            "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            "transition",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
