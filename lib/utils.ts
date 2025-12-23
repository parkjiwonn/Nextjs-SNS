import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * 이미지 파일 validation 결과 타입
 */
export type ImageValidationResult = {
  isValid: boolean;
  error?: string;
};

/**
 * 이미지 파일 크기 제한 (기본 5MB)
 */
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

/**
 * 이미지 파일의 유효성을 검증합니다
 * @param file - 검증할 파일
 * @param maxSize - 최대 파일 크기 (bytes, 기본값: 5MB)
 * @returns ImageValidationResult
 */
export function validateImageFile(
  file: File,
  maxSize: number = MAX_IMAGE_SIZE
): ImageValidationResult {
  // 파일 크기 검증
  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    return {
      isValid: false,
      error: `파일 크기는 ${maxSizeMB}MB 이하여야 합니다`,
    };
  }

  // 이미지 파일 타입 검증
  if (!file.type.startsWith("image/")) {
    return {
      isValid: false,
      error: "이미지 파일만 업로드 가능합니다",
    };
  }

  return { isValid: true };
}

/**
 * 파일을 읽어 미리보기 URL을 생성합니다
 * @param file - 읽을 파일
 * @returns Promise<string> - Data URL
 */
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      reject(new Error("파일을 읽는 중 오류가 발생했습니다"));
    };
    reader.readAsDataURL(file);
  });
}
