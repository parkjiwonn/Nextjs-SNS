import { forwardRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Button 컴포넌트의 Props
 * HTML button 엘리먼트의 모든 속성을 상속받습니다.
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 버튼의 시각적 스타일 variant (기본값: "primary") */
  variant?: "primary" | "secondary" | "outline" | "ghost";
  /** 버튼의 크기 (기본값: "md") */
  size?: "sm" | "md" | "lg";
  /** 로딩 상태 여부 (true일 경우 스피너 표시 및 disabled) */
  isLoading?: boolean;
}

/**
 * variant별 스타일 매핑
 * @private
 */
const variantStyles = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "bg-gray-600 text-white hover:bg-gray-700",
  outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50",
  ghost: "text-blue-600 hover:bg-blue-50",
};

/**
 * size별 스타일 매핑
 * @private
 */
const sizeStyles = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-3",
  lg: "px-6 py-4 text-lg",
};

/**
 * Button 컴포넌트
 *
 * 재사용 가능한 버튼 컴포넌트입니다.
 * 4가지 variant(primary, secondary, outline, ghost)와 3가지 size(sm, md, lg)를 지원하며,
 * 로딩 상태 표시 기능이 내장되어 있습니다.
 *
 * @component
 * @example
 * // 기본 사용 (primary variant, medium size)
 * <Button type="submit">
 *   로그인
 * </Button>
 *
 * @example
 * // Secondary variant
 * <Button variant="secondary">
 *   취소
 * </Button>
 *
 * @example
 * // Outline variant
 * <Button variant="outline">
 *   더 알아보기
 * </Button>
 *
 * @example
 * // Ghost variant
 * <Button variant="ghost">
 *   닫기
 * </Button>
 *
 * @example
 * // 작은 크기
 * <Button size="sm">
 *   작은 버튼
 * </Button>
 *
 * @example
 * // 큰 크기
 * <Button size="lg">
 *   큰 버튼
 * </Button>
 *
 * @example
 * // 로딩 상태
 * <Button isLoading={loading}>
 *   저장
 * </Button>
 *
 * @example
 * // disabled 상태
 * <Button disabled>
 *   비활성화
 * </Button>
 *
 * @example
 * // onClick 핸들러와 함께
 * <Button onClick={() => console.log('클릭!')}>
 *   클릭하세요
 * </Button>
 *
 * @example
 * // ref를 사용한 제어
 * const buttonRef = useRef<HTMLButtonElement>(null);
 * <Button ref={buttonRef}>
 *   포커스 가능
 * </Button>
 *
 * @example
 * // 조합 예시 (로딩 상태가 있는 폼 제출 버튼)
 * const [loading, setLoading] = useState(false);
 * const handleSubmit = async () => {
 *   setLoading(true);
 *   // API 호출...
 *   setLoading(false);
 * };
 * <Button
 *   type="submit"
 *   variant="primary"
 *   size="lg"
 *   isLoading={loading}
 *   onClick={handleSubmit}
 * >
 *   제출하기
 * </Button>
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "w-full rounded-lg font-semibold transition",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            로딩 중...
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
