import createClient from 'openapi-fetch';
import type { paths } from '@/generated/api/schema';

// API 클라이언트 생성
export const apiClient = createClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002',
});

// 에러 응답 타입 정의
interface ApiErrorResponse {
  error: string;
}

// 타입 안전한 API 호출 예시

/**
 * 회원가입 API
 */
export async function signup(data: {
  email: string;
  username: string;
  password: string;
  name: string;
}) {
  const { data: response, error } = await apiClient.POST('/api/auth/signup', {
    body: data,
  });

  if (error) {
    const errorResponse = error as ApiErrorResponse;
    throw new Error(errorResponse.error || '회원가입 실패');
  }

  return response;
}

/**
 * 게시글 작성 API
 */
export async function createPost(content: string, images?: File[]) {
  const formData = new FormData();
  formData.append('content', content);

  if (images) {
    images.forEach((image) => {
      formData.append('images', image);
    });
  }

  // FormData는 fetch API로 직접 전송
  const response = await fetch('/api/posts', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || '게시글 작성 실패');
  }

  return await response.json();
}

/**
 * DB 연결 테스트 API
 */
export async function testDB() {
  const { data: response, error } = await apiClient.GET('/api/test-db');

  if (error) {
    const errorResponse = error as ApiErrorResponse;
    throw new Error(errorResponse.error || 'DB 연결 실패');
  }

  return response;
}
