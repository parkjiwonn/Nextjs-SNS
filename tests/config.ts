// 테스트 설정
export const config = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3002',
  timeout: 30000,
} as const;
