/**
 * 에러 및 성공 메시지 상수
 */

export const ERROR_MESSAGES = {
  // 공통
  COMMON: {
    UNKNOWN: '알 수 없는 오류가 발생했습니다',
    NETWORK: '네트워크 오류가 발생했습니다',
    SERVER: '서버 오류가 발생했습니다',
    UNAUTHORIZED: '로그인이 필요합니다',
    FORBIDDEN: '권한이 없습니다',
  },

  // 인증
  AUTH: {
    INVALID_CREDENTIALS: '이메일 또는 비밀번호가 올바르지 않습니다',
    EMAIL_REQUIRED: '이메일을 입력해주세요',
    PASSWORD_REQUIRED: '비밀번호를 입력해주세요',
    PASSWORD_TOO_SHORT: '비밀번호는 최소 8자 이상이어야 합니다',
    PASSWORD_MISMATCH: '비밀번호가 일치하지 않습니다',
    EMAIL_ALREADY_EXISTS: '이미 사용 중인 이메일입니다',
    USERNAME_ALREADY_EXISTS: '이미 사용 중인 유저네임입니다',
    SESSION_EXPIRED: '세션이 만료되었습니다. 다시 로그인해주세요',
  },

  // 프로필
  PROFILE: {
    LOAD_FAILED: '프로필을 불러올 수 없습니다',
    UPDATE_FAILED: '프로필 업데이트에 실패했습니다',
    NAME_REQUIRED: '이름을 입력해주세요',
  },

  // 파일 업로드
  FILE: {
    TOO_LARGE: '파일 크기는 5MB 이하여야 합니다',
    INVALID_TYPE: '이미지 파일만 업로드 가능합니다',
    READ_ERROR: '파일을 읽는 중 오류가 발생했습니다',
  },

  // 게시물
  POST: {
    CREATE_FAILED: '게시물 작성에 실패했습니다',
    CONTENT_REQUIRED: '내용을 입력해주세요',
    LOAD_FAILED: '게시물을 불러올 수 없습니다',
  },

  // 데이터베이스
  DB: {
    CONNECTION_FAILED: '데이터베이스 연결에 실패했습니다',
  },
} as const;

export const SUCCESS_MESSAGES = {
  // 인증
  AUTH: {
    SIGNUP_SUCCESS: '회원가입이 완료되었습니다',
    SIGNIN_SUCCESS: '로그인 되었습니다',
    SIGNOUT_SUCCESS: '로그아웃 되었습니다',
  },

  // 프로필
  PROFILE: {
    UPDATE_SUCCESS: '프로필이 성공적으로 업데이트되었습니다!',
  },

  // 게시물
  POST: {
    CREATE_SUCCESS: '게시물이 작성되었습니다',
    UPDATE_SUCCESS: '게시물이 수정되었습니다',
    DELETE_SUCCESS: '게시물이 삭제되었습니다',
  },
} as const;

/**
 * 에러 메시지 타입
 */
export type ErrorMessages = typeof ERROR_MESSAGES;

/**
 * 성공 메시지 타입
 */
export type SuccessMessages = typeof SUCCESS_MESSAGES;
