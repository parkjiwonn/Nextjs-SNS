/**
 * API 엔드포인트 상수
 */

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    SIGNUP: '/api/auth/signup',
    SIGNIN: '/api/auth/signin',
    SIGNOUT: '/api/auth/signout',
    SESSION: '/api/auth/session',
    CSRF: '/api/auth/csrf',
    CALLBACK: '/api/auth/callback/credentials',
  },

  // Profile
  PROFILE: '/api/profile',

  // Posts
  POSTS: '/api/posts',

  // Test
  TEST_DB: '/api/test-db',

  // Swagger
  SWAGGER: '/api/swagger',
} as const;

/**
 * API 엔드포인트 타입
 */
export type ApiEndpoint = typeof API_ENDPOINTS;
