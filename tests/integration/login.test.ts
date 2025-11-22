
import { config } from '../config';
import { test, expect, printResults, exitWithResults } from '../helpers/test-runner';
import { logHeader, log } from '../helpers/logger';
import type { UserData, SignupResponse, ErrorResponse } from '../helpers/types';

const BASE_URL = config.baseUrl;

// 테스트용 사용자 생성 헬퍼
async function createTestUser(): Promise<UserData> {
  const randomId = Date.now();
  const userData: UserData = {
    email: `logintest${randomId}@test.com`,
    username: `loginuser${randomId}`,
    password: 'test1234',
    name: '로그인테스트'
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

// CSRF 토큰 가져오기
async function getCsrfToken(): Promise<{ csrfToken: string; cookies: string }> {
  const response = await fetch(`${BASE_URL}/api/auth/csrf`);
  const data = await response.json();
  
  // Set-Cookie 헤더에서 쿠키 추출
  const setCookieHeaders = response.headers.getSetCookie?.() || [];
  const cookies = setCookieHeaders
    .map(cookie => cookie.split(';')[0])
    .join('; ');
  
  return {
    csrfToken: data.csrfToken,
    cookies: cookies
  };
}

// NextAuth를 사용한 로그인
async function login(email: string, password: string) {
  const { csrfToken, cookies: csrfCookies } = await getCsrfToken();
  
  const response = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': csrfCookies, // 👈 CSRF 쿠키 포함
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
  const responseText = await response.text();

  console.log('\n===== 로그인 응답 상세 =====');
  console.log('Status:', response.status);
  console.log('응답 본문:', responseText);
  console.log('Set-Cookie 헤더 개수:', setCookieHeaders.length);
  setCookieHeaders.forEach((cookie, i) => {
    console.log(`\n쿠키 ${i + 1}:`);
    console.log(cookie);
  });
  console.log('===========================\n');

  const cookies = setCookieHeaders
    .map(cookie => cookie.split(';')[0])
    .join('; ');
    
  return { response, cookies };
}

// 세션 확인
async function getSession(cookies: string | null) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (cookies) {
    headers['Cookie'] = cookies;
  }

  const response = await fetch(`${BASE_URL}/api/auth/session`, {
    headers
  });

  const data = await response.json();
  return { response, data };
}

// ===== 성공 케이스 =====

async function testLoginSuccess(testUser: UserData): Promise<void> {
  const { response, cookies } = await login(testUser.email, testUser.password);

  // NextAuth는 로그인 성공 시 리다이렉트 (302 또는 200)
  const isSuccess = response.status === 302 || response.status === 200;
  expect(isSuccess, true, 'Login should succeed with redirect or 200');

  // 세션 쿠키가 설정되어야 함
  expect(!!cookies, true, 'Should set session cookies');

  log(`   로그인 성공: ${testUser.email}`, 'yellow');
  log(`   쿠키 설정됨: ${cookies?.substring(0, 50)}...`, 'yellow');

  // 세션 확인
  const { data: sessionData } = await getSession(cookies);
  expect(!!sessionData.user, true, 'Session should contain user data');
  expect(sessionData.user.email, testUser.email, 'Session email should match');

  log(`   세션 사용자: ${sessionData.user.email}`, 'yellow');
}

// ===== 실패 케이스: 잘못된 비밀번호 =====

async function testLoginWrongPassword(testUser: UserData): Promise<void> {
  const { response, cookies } = await login(testUser.email, 'wrongpassword');

  // 로그인 실패 시 리다이렉트 또는 에러
  // NextAuth는 실패 시에도 302로 리다이렉트할 수 있음
  const { data: sessionData } = await getSession(cookies);

  // 세션에 사용자 정보가 없어야 함
  expect(!!sessionData.user, false, 'Session should not contain user data');

  log(`   잘못된 비밀번호로 로그인 실패`, 'yellow');
}

// ===== 실패 케이스: 존재하지 않는 사용자 =====

async function testLoginNonExistentUser(): Promise<void> {
  const { response, cookies } = await login('nonexistent@test.com', 'password123');

  const { data: sessionData } = await getSession(cookies);

  expect(!!sessionData.user, false, 'Session should not contain user data');

  log(`   존재하지 않는 사용자로 로그인 실패`, 'yellow');
}

// ===== 실패 케이스: 필수 필드 누락 =====

async function testLoginMissingEmail(): Promise<void> {
  try {
    const { csrfToken, cookies: csrfCookies } = await getCsrfToken(); // 👈 수정

    const response = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': csrfCookies, // 👈 추가
      },
      body: new URLSearchParams({
        // email 누락
        password: 'test1234',
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
    
    const { data: sessionData } = await getSession(cookies);

    expect(!!sessionData.user, false, 'Session should not contain user data');

    log(`   이메일 누락으로 로그인 실패`, 'yellow');
  } catch (error) {
    log(`   이메일 누락 처리됨`, 'yellow');
  }
}

async function testLoginMissingPassword(): Promise<void> {
  try {
    const { csrfToken, cookies: csrfCookies } = await getCsrfToken(); // 👈 수정

    const response = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': csrfCookies, // 👈 추가
      },
      body: new URLSearchParams({
        email: 'test@test.com',
        // password 누락
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
    
    const { data: sessionData } = await getSession(cookies);

    expect(!!sessionData.user, false, 'Session should not contain user data');

    log(`   비밀번호 누락으로 로그인 실패`, 'yellow');
  } catch (error) {
    log(`   비밀번호 누락 처리됨`, 'yellow');
  }
}

// ===== 실패 케이스: 빈 문자열 =====

async function testLoginEmptyEmail(): Promise<void> {
  const { response, cookies } = await login('', 'password123');

  const { data: sessionData } = await getSession(cookies);

  expect(!!sessionData.user, false, 'Session should not contain user data');

  log(`   빈 이메일로 로그인 실패`, 'yellow');
}

async function testLoginEmptyPassword(testUser: UserData): Promise<void> {
  const { response, cookies } = await login(testUser.email, '');

  const { data: sessionData } = await getSession(cookies);

  expect(!!sessionData.user, false, 'Session should not contain user data');

  log(`   빈 비밀번호로 로그인 실패`, 'yellow');
}

// ===== 실패 케이스: 공백 문자열 =====

async function testLoginWhitespaceEmail(): Promise<void> {
  const { response, cookies } = await login('   ', 'password123');

  const { data: sessionData } = await getSession(cookies);

  expect(!!sessionData.user, false, 'Session should not contain user data');

  log(`   공백 이메일로 로그인 실패`, 'yellow');
}

async function testLoginWhitespacePassword(testUser: UserData): Promise<void> {
  const { response, cookies } = await login(testUser.email, '   ');

  const { data: sessionData } = await getSession(cookies);

  expect(!!sessionData.user, false, 'Session should not contain user data');

  log(`   공백 비밀번호로 로그인 실패`, 'yellow');
}

// ===== 메인 실행 =====

async function runTests(): Promise<void> {
  logHeader('로그인 통합 테스트');

  // 테스트용 사용자 생성
  log('\n📝 테스트용 사용자 생성 중...', 'blue');
  const testUser = await createTestUser();
  log(`✅ 테스트 사용자 생성 완료: ${testUser.email}`, 'green');

  // 1. 성공 케이스
  await test('[성공] 올바른 이메일/비밀번호로 로그인', () => testLoginSuccess(testUser));

  // 2. 실패 케이스 - 잘못된 정보
  await test('[실패] 잘못된 비밀번호', () => testLoginWrongPassword(testUser));
  await test('[실패] 존재하지 않는 사용자', testLoginNonExistentUser);

  // 3. 실패 케이스 - 필수 필드 누락
  await test('[실패] 이메일 누락', testLoginMissingEmail);
  await test('[실패] 비밀번호 누락', testLoginMissingPassword);

  // 4. 실패 케이스 - 빈 문자열
  await test('[실패] 빈 이메일', testLoginEmptyEmail);
  await test('[실패] 빈 비밀번호', () => testLoginEmptyPassword(testUser));

  // 5. 실패 케이스 - 공백 문자열
  await test('[실패] 공백 이메일', testLoginWhitespaceEmail);
  await test('[실패] 공백 비밀번호', () => testLoginWhitespacePassword(testUser));

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
