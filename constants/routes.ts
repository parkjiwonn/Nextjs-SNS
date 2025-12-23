/**
 * 라우트 경로 상수
 */

export const ROUTES = {
  // Public routes
  HOME: '/',
  SIGNIN: '/signin',
  SIGNUP: '/signup',

  // Protected routes
  PROFILE: '/profile',

  // Posts routes
  POSTS: {
    NEW: '/posts/new',
    DETAIL: (id: string) => `/posts/${id}`,
    EDIT: (id: string) => `/posts/${id}/edit`,
  },

  // API Documentation
  API_DOCS: '/api-docs',
} as const;

/**
 * 라우트 타입
 */
export type Route = typeof ROUTES;

/**
 * 라우트 경로 값 타입
 */
export type RouteValue = typeof ROUTES[keyof typeof ROUTES];
