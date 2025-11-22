// 공통 타입 정의

export type ColorType = 'reset' | 'green' | 'red' | 'yellow' | 'blue';

export interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL';
  error?: string;
}

export interface TestResults {
  passed: number;
  failed: number;
  tests: TestResult[];
}

// API 응답 타입들
export interface UserData {
  email: string;
  username: string;
  password: string;
  name: string;
}

export interface SignupResponse {
  message: string;
  user: {
    id: string;
    email: string;
    username: string;
    name: string;
  };
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    username: string;
    name: string;
  };
  token?: string;
}

export interface ErrorResponse {
  error: string;
}

export interface DbTestResponse {
  success: boolean;
  message: string;
  userCount?: number;
  error?: string;
}

export interface PostResponse {
  message: string;
  postId: string;
}
