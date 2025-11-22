
// 세션 관리 통합 테스트
import { config } from '../config';
import { test, expect, printResults, exitWithResults } from '../helpers/test-runner';
import { logHeader, log } from '../helpers/logger';
import type { UserData } from '../helpers/types';

const BASE_URL = config.baseUrl;

// 테스트용 사용자 생성
async function createTestUser(): Promise<UserData> {
  const randomId = Date.now();
  const userData: UserData = {
    email: `sessiontest${randomId}@test.com`,
    username: `sessionuser${randomId}`,
    password: 'test1234',
    name: '세션테스트'
  };

  const response = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });

  if (response.status !== 201) {
    throw new Error('Failed to create test user');
  }

  return userData;
}

// CSRF 토큰과 쿠키 가져오기
async function getCsrfToken(): Promise<{ csrfToken: string; cookies: string }> {
  const response = await fetch(`${BASE_URL}/api/auth/csrf`);
  const data = await response.json();

  const setCookieHeaders = response.headers.getSetCookie?.() || [];
  const cookies = setCookieHeaders
    .map(cookie => cookie.split(';')[0])
    .join('; ');

  return { csrfToken: data.csrfToken, cookies };
}

// 로그인
async function login(email: string, password: string): Promise<string> {
  const { csrfToken, cookies: csrfCookies } = await getCsrfToken();

  const response = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': csrfCookies,
    },
    body: new URLSearchParams({
      email,
      password,
      csrfToken,
      callbackUrl: `${BASE_URL}`,
      json: 'true'
    }),
    redirect: 'manual'
  });

  const setCookieHeaders = response.headers.getSetCookie?.() || [];
  const cookies = setCookieHeaders
    .map(cookie => cookie.split(';')[0])
    .join('; ');

  return cookies;
}

// 세션 확인
async function getSession(cookies: string) {
  const response = await fetch(`${BASE_URL}/api/auth/session`, {
    headers: { 'Cookie': cookies }
  });

  const data = await response.json();
  return { response, data };
}

// 보호된 API 호출 (게시글 작성)
async function createPost(cookies: string, content: string) {
  const formData = new FormData();
  formData.append('content', content);

  const response = await fetch(`${BASE_URL}/api/posts`, {
    method: 'POST',
    headers: { 'Cookie': cookies },
    body: formData
  });

  const data = await response.json();
  return { response, data };
}

// 로그아웃
async function logout(cookies: string): Promise<string> {
  const { csrfToken, cookies: csrfCookies } = await getCsrfToken();

  // 기존 세션 쿠키와 CSRF 쿠키 합치기
  const allCookies = `${cookies}; ${csrfCookies}`;

  const response = await fetch(`${BASE_URL}/api/auth/signout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': allCookies,
    },
    body: new URLSearchParams({
      csrfToken,
      callbackUrl: `${BASE_URL}`,
      json: 'true'
    }),
    redirect: 'manual'
  });

  // 로그아웃 후 쿠키 (세션이 삭제되어야 함)
  const setCookieHeaders = response.headers.getSetCookie?.() || [];
  const newCookies = setCookieHeaders
    .map(cookie => cookie.split(';')[0])
    .join('; ');

  return newCookies;
}

// ===== 테스트 1: 로그인 후 세션 쿠키 발급 확인 =====

async function testSessionCookieIssued(testUser: UserData): Promise<string> {
  const cookies = await login(testUser.email, testUser.password);

  // 세션 토큰이 포함되어야 함
  expect(cookies.includes('next-auth.session-token'), true, 'Should contain session token');

  log(`   세션 쿠키 발급됨`, 'yellow');
  log(`   쿠키: ${cookies.substring(0, 80)}...`, 'yellow');

  return cookies;
}

// ===== 테스트 2: 세션에 올바른 사용자 정보 포함 확인 =====

async function testSessionContainsUserInfo(testUser: UserData, cookies: string): Promise<void> {
  const { data: sessionData } = await getSession(cookies);

  // 세션에 사용자 정보가 있어야 함
  expect(!!sessionData.user, true, 'Session should contain user data');
  expect(sessionData.user.email, testUser.email, 'Email should match');
  expect(sessionData.user.name, testUser.name, 'Name should match');
  expect(!!sessionData.user.id, true, 'Should contain user ID');

  log(`   세션 사용자 이메일: ${sessionData.user.email}`, 'yellow');
  log(`   세션 사용자 이름: ${sessionData.user.name}`, 'yellow');
  log(`   세션 사용자 ID: ${sessionData.user.id}`, 'yellow');
}

// ===== 테스트 3: 세션으로 보호된 API 호출 성공 =====

async function testProtectedApiWithValidSession(cookies: string): Promise<void> {
  const { response, data } = await createPost(cookies, '테스트 게시글입니다');

  expect(response.status, 201, 'Should create post successfully');
  expect(!!data.postId, true, 'Should return post ID');
  expect(data.message, '게시글 작성 완료', 'Should return success message');

  log(`   게시글 작성 성공: ${data.postId}`, 'yellow');
}

// ===== 테스트 4: 세션 없이 보호된 API 호출 실패 =====

async function testProtectedApiWithoutSession(): Promise<void> {
  const { response, data } = await createPost('', '테스트 게시글');

  expect(response.status, 401, 'Should return 401 Unauthorized');
  expect(!!data.error, true, 'Should return error message');
  expect(data.error, '로그인이 필요합니다', 'Should return login required message');

  log(`   에러 메시지: ${data.error}`, 'yellow');
}

// ===== 테스트 5: 잘못된 세션으로 보호된 API 호출 실패 =====

async function testProtectedApiWithInvalidSession(): Promise<void> {
  const invalidCookies = 'next-auth.session-token=invalid-token-12345';

  const { response, data } = await createPost(invalidCookies, '테스트 게시글');

  expect(response.status, 401, 'Should return 401 Unauthorized');
  expect(!!data.error, true, 'Should return error message');

  log(`   잘못된 세션으로 접근 차단됨`, 'yellow');
}

// ===== 테스트 6: 만료된 세션 토큰 테스트 =====

async function testExpiredSessionToken(): Promise<void> {
  // 과거 시간의 세션 토큰 (실제로는 만료되지 않지만 형식만 테스트)
  const expiredCookies = 'next-auth.session-token=eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjB9.invalid';

  const { response, data } = await createPost(expiredCookies, '테스트 게시글');

  expect(response.status, 401, 'Should return 401 Unauthorized');

  log(`   만료된 세션으로 접근 차단됨`, 'yellow');
}

// ===== 테스트 7: 세션 정보의 무결성 검증 =====

async function testSessionDataIntegrity(testUser: UserData, cookies: string): Promise<void> {
  const { data: sessionData } = await getSession(cookies);

  // 비밀번호가 세션에 포함되지 않아야 함
  const sessionJson = JSON.stringify(sessionData);
  expect(sessionJson.includes(testUser.password), false, 'Session should not contain password');
  expect(sessionJson.includes('password'), false, 'Session should not have password field');

  // 필수 필드가 있어야 함
  expect(!!sessionData.user.id, true, 'Should have user ID');
  expect(!!sessionData.user.email, true, 'Should have email');
  expect(!!sessionData.user.name, true, 'Should have name');

  log(`   세션에 비밀번호 미포함 확인`, 'yellow');
  log(`   필수 필드 존재 확인`, 'yellow');
}

// ===== 테스트 8: 여러 개의 세션 동시 유지 =====

async function testMultipleSessions(testUser1: UserData, testUser2: UserData): Promise<void> {
  const cookies1 = await login(testUser1.email, testUser1.password);
  const cookies2 = await login(testUser2.email, testUser2.password);

  const { data: session1 } = await getSession(cookies1);
  const { data: session2 } = await getSession(cookies2);

  // 각 세션이 올바른 사용자 정보를 가지고 있어야 함
  expect(session1.user.email, testUser1.email, 'Session 1 should have user 1 email');
  expect(session2.user.email, testUser2.email, 'Session 2 should have user 2 email');

  // 서로 다른 사용자여야 함
  expect(session1.user.id === session2.user.id, false, 'Sessions should be for different users');

  log(`   세션 1: ${session1.user.email}`, 'yellow');
  log(`   세션 2: ${session2.user.email}`, 'yellow');
}

// ===== 테스트 9: 로그아웃 후 세션 무효화 =====

async function testLogoutInvalidatesSession(testUser: UserData): Promise<void> {
  // 로그인
  const cookies = await login(testUser.email, testUser.password);

  // 로그인 후 세션 확인
  const { data: sessionBefore } = await getSession(cookies);
  expect(!!sessionBefore.user, true, 'Session should exist before logout');

  log(`   로그인 상태: ${sessionBefore.user.email}`, 'yellow');

  // 로그아웃
  const newCookies = await logout(cookies);

  log(`   로그아웃 완료`, 'yellow');

  // 로그아웃 후 세션 확인 (기존 쿠키 사용)
  const { data: sessionAfter } = await getSession(cookies);
  expect(!!sessionAfter.user, false, 'Session should be invalidated after logout');

  log(`   세션 무효화 확인`, 'yellow');
}

// ===== 테스트 10: 로그아웃 후 보호된 API 접근 실패 =====

async function testProtectedApiAfterLogout(testUser: UserData): Promise<void> {
  // 로그인
  const cookies = await login(testUser.email, testUser.password);

  // 로그인 상태에서 게시글 작성 성공 확인
  const { response: beforeResponse } = await createPost(cookies, '로그아웃 전 테스트');
  expect(beforeResponse.status, 201, 'Should create post before logout');

  log(`   로그인 상태에서 게시글 작성 성공`, 'yellow');

  // 로그아웃
  await logout(cookies);

  log(`   로그아웃 완료`, 'yellow');

  // 로그아웃 후 게시글 작성 시도 (기존 쿠키 사용)
  const { response: afterResponse, data: afterData } = await createPost(cookies, '로그아웃 후 테스트');

  expect(afterResponse.status, 401, 'Should return 401 after logout');
  expect(!!afterData.error, true, 'Should return error message');
  expect(afterData.error, '로그인이 필요합니다', 'Should return login required message');

  log(`   로그아웃 후 API 접근 차단 확인: ${afterData.error}`, 'yellow');
}

// ===== 메인 실행 =====

async function runTests(): Promise<void> {
  logHeader('세션 관리 통합 테스트');

  // 테스트용 사용자 생성
  log('\n📝 테스트용 사용자 생성 중...', 'blue');
  const testUser = await createTestUser();
  log(`✅ 테스트 사용자 1 생성 완료: ${testUser.email}`, 'green');

  let sessionCookies: string = '';

  // 1. 세션 쿠키 발급
  await test('[발급] 로그인 후 세션 쿠키 발급 확인', async () => {
    sessionCookies = await testSessionCookieIssued(testUser);
  });

  // 2. 세션 사용자 정보 확인
  if (sessionCookies) {
    await test('[정보] 세션에 올바른 사용자 정보 포함', () =>
      testSessionContainsUserInfo(testUser, sessionCookies)
    );

    await test('[무결성] 세션 데이터 무결성 검증', () =>
      testSessionDataIntegrity(testUser, sessionCookies)
    );
  }

  // 3. 보호된 API 호출 - 성공
  if (sessionCookies) {
    await test('[성공] 유효한 세션으로 보호된 API 호출', () =>
      testProtectedApiWithValidSession(sessionCookies)
    );
  }

  // 4. 보호된 API 호출 - 실패 케이스들
  await test('[실패] 세션 없이 보호된 API 호출', testProtectedApiWithoutSession);
  await test('[실패] 잘못된 세션으로 보호된 API 호출', testProtectedApiWithInvalidSession);
  await test('[실패] 만료된 세션 토큰', testExpiredSessionToken);

  // 5. 다중 세션 테스트
  log('\n📝 두 번째 테스트 사용자 생성 중...', 'blue');
  const testUser2 = await createTestUser();
  log(`✅ 테스트 사용자 2 생성 완료: ${testUser2.email}`, 'green');

  await test('[다중] 여러 세션 동시 유지', () =>
    testMultipleSessions(testUser, testUser2)
  );

  // 결과 출력
  printResults();

  // 종료
  exitWithResults();
}

// 실행
runTests().catch((error: Error) => {
  log(`\n⚠️  테스트 실행 중 오류 발생: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
