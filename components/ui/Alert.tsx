import { cn } from "@/lib/utils";

/**
 * Alert 컴포넌트의 variant 타입
 * @type {("success" | "error" | "warning" | "info")}
 */
type AlertVariant = "success" | "error" | "warning" | "info";

/**
 * Alert 컴포넌트의 Props
 */
interface AlertProps {
  /** Alert의 스타일 variant (성공, 에러, 경고, 정보) */
  variant: AlertVariant;
  /** Alert 내부에 표시될 내용 */
  children: React.ReactNode;
  /** 추가 CSS 클래스명 (선택사항) */
  className?: string;
}

/**
 * variant별 스타일 매핑
 * @private
 */
const variantStyles: Record<AlertVariant, string> = {
  success: "bg-green-50 border-green-500 text-green-700",
  error: "bg-red-50 border-red-500 text-red-700",
  warning: "bg-yellow-50 border-yellow-500 text-yellow-700",
  info: "bg-blue-50 border-blue-500 text-blue-700",
};

/**
 * Alert 컴포넌트
 *
 * 사용자에게 중요한 메시지를 표시하는 재사용 가능한 알림 컴포넌트입니다.
 * 성공, 에러, 경고, 정보의 4가지 variant를 지원합니다.
 *
 * @component
 * @example
 * // 성공 메시지
 * <Alert variant="success">
 *   회원가입이 완료되었습니다!
 * </Alert>
 *
 * @example
 * // 에러 메시지
 * <Alert variant="error">
 *   이메일 또는 비밀번호가 올바르지 않습니다.
 * </Alert>
 *
 * @example
 * // 경고 메시지
 * <Alert variant="warning">
 *   세션이 곧 만료됩니다.
 * </Alert>
 *
 * @example
 * // 정보 메시지
 * <Alert variant="info">
 *   새로운 업데이트가 있습니다.
 * </Alert>
 *
 * @example
 * // 커스텀 클래스 추가
 * <Alert variant="success" className="mt-4">
 *   저장되었습니다!
 * </Alert>
 */
export function Alert({ variant, children, className }: AlertProps) {
  return (
    <div
      className={cn(
        "border-l-4 p-4 rounded",
        variantStyles[variant],
        className
      )}
      role="alert"
    >
      <p className="text-sm">{children}</p>
    </div>
  );
}
