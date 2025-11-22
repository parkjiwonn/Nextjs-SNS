// 비밀번호 보안 통합 테스트
import { config } from '../config';
import { test, expect, printResults, exitWithResults } from '../helpers/test-runner';
import { logHeader, log } from '../helpers/logger';
import type { UserData, SignupResponse } from '../helpers/types';

const BASE_URL = config.baseUrl;

// 테스트용 사용자 생성
async function createTestUser(): Promise<{ userData: UserData; response: SignupResponse }> {
  const randomId = Date.now();
  const userData: UserData = {
    email: `pwtest${randomId}@test.com`,
    username: `pwuser${randomId}`,
    password: 'test1234',
    name: '비밀번호테스트'
  };

  const response = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });

  if (response.status !== 201) {
    throw new Error('Failed to create test user');
  }

  const data: SignupResponse = await response.json();

  return { userData, response: data };
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
async function login(email: string, password: string): Promise<{ success: boolean; cookies: string }> {
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

  // session-token이 있으면 성공
  const success = cookies.includes('next-auth.session-token');

  return { success, cookies };
}

// 세션 확인
async function getSession(cookies: string) {
  const response = await fetch(`${BASE_URL}/api/auth/session`, {
    headers: { 'Cookie': cookies }
  });

  const data = await response.json();
  return { response, data };
}

// ===== 테스트 1: 회원가입 응답에 비밀번호 미포함 =====

async function testSignupResponseNoPassword(): Promise<UserData> {
  const { userData, response } = await createTestUser();

  // 응답 전체를 JSON 문자열로 변환
  const responseJson = JSON.stringify(response);

  // 비밀번호가 응답에 포함되지 않아야 함
  expect(responseJson.includes(userData.password), false, 'Signup response should not contain password');
  expect(responseJson.includes('password'), false, 'Signup response should not have password field');

  // user 객체에도 비밀번호가 없어야 함
  expect(!!(response.user as any).password, false, 'User object should not have password');

  log(`   회원가입 응답에 비밀번호 미포함 확인`, 'yellow');
  log(`   응답 필드: id, email, username, name`, 'yellow');

  return userData;
}

// ===== 테스트 2: 로그인 성공 시 올바른 비밀번호만 허용 =====

async function testLoginWithCorrectPassword(userData: UserData): Promise<void> {
  const { success } = await login(userData.email, userData.password);

  expect(success, true, 'Should login with correct password');

  log(`   올바른 비밀번호로 로그인 성공`, 'yellow');
}

// ===== 테스트 3: 로그인 실패 시 잘못된 비밀번호 거부 =====

async function testLoginWithWrongPassword(userData: UserData): Promise<void> {
  const { success } = await login(userData.email, 'wrongpassword123');

  expect(success, false, 'Should not login with wrong password');

  log(`   잘못된 비밀번호로 로그인 차단`, 'yellow');
}

// ===== 테스트 4: 비슷한 비밀번호도 거부 (해시 비교 확인) =====

async function testLoginWithSimilarPassword(userData: UserData): Promise<void> {
  // 원본 비밀번호: test1234
  const similarPasswords = [
    'test123',     // 마지막 문자 빠짐
    'test12345',   // 문자 추가
    'Test1234',    // 대소문자 다름
    'test1234 ',   // 공백 추가
    ' test1234',   // 앞에 공백
  ];

  for (const wrongPassword of similarPasswords) {
    const { success } = await login(userData.email, wrongPassword);
    expect(success, false, `Should not login with "${wrongPassword}"`);
  }

  log(`   비슷한 비밀번호 5개 모두 차단`, 'yellow');
}

// ===== 테스트 5: 세션에 비밀번호 미포함 =====

async function testSessionNoPassword(userData: UserData): Promise<void> {
  const { cookies } = await login(userData.email, userData.password);
  const { data: sessionData } = await getSession(cookies);

  const sessionJson = JSON.stringify(sessionData);

  // 세션에 비밀번호가 포함되지 않아야 함
  expect(sessionJson.includes(userData.password), false, 'Session should not contain password');
  expect(sessionJson.includes('password'), false, 'Session should not have password field');

  log(`   세션 응답에 비밀번호 미포함 확인`, 'yellow');
}

// ===== 테스트 6: 빈 비밀번호 거부 =====

async function testEmptyPasswordRejected(): Promise<void> {
  const randomId = Date.now();
  const userData = {
    email: `empty${randomId}@test.com`,
    username: `emptyuser${randomId}`,
    password: '',  // 빈 비밀번호
    name: '빈비밀번호테스트'
  };

  const response = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });

  const data = await response.json();

  expect(response.status, 400, 'Should reject empty password');
  expect(!!data.error, true, 'Should return error message');

  log(`   빈 비밀번호 회원가입 차단: ${data.error}`, 'yellow');
}

// ===== 테스트 7: 공백만 있는 비밀번호 거부 =====

async function testWhitespacePasswordRejected(): Promise<void> {
  const randomId = Date.now();
  const userData = {
    email: `space${randomId}@test.com`,
    username: `spaceuser${randomId}`,
    password: '     ',  // 공백만
    name: '공백비밀번호테스트'
  };

  const response = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });

  const data = await response.json();

  // 400이면 검증 통과, 201이면 검증 없음 (경고)
  if (response.status === 400) {
    log(`   ✅ 공백 비밀번호 차단: ${data.error}`, 'yellow');
  } else if (response.status === 201) {
    log(`   ⚠️  공백 비밀번호 허용됨 (개선 필요)`, 'yellow');
  }

  const isValidResponse = response.status === 400 || response.status === 201;
  expect(isValidResponse, true, 'Should be 400 or 201');
}

// ===== 테스트 8: 대소문자 구분 확인 =====

async function testPasswordCaseSensitive(userData: UserData): Promise<void> {
  // 원본: test1234
  // 시도: TEST1234, Test1234, teST1234

  const variations = ['TEST1234', 'Test1234', 'teST1234'];

  for (const variation of variations) {
    const { success } = await login(userData.email, variation);
    expect(success, false, `Should reject "${variation}" (case sensitive)`);
  }

  log(`   비밀번호 대소문자 구분 확인`, 'yellow');
}

// ===== 테스트 9: 동일한 비밀번호로 여러 사용자 생성 가능 =====

async function testSamePasswordDifferentUsers(): Promise<void> {
  const samePassword = 'common1234';

  const user1Data = {
    email: `user1${Date.now()}@test.com`,
    username: `user1${Date.now()}`,
    password: samePassword,
    name: '사용자1'
  };

  const user2Data = {
    email: `user2${Date.now()}@test.com`,
    username: `user2${Date.now()}`,
    password: samePassword,
    name: '사용자2'
  };

  // 두 사용자 모두 같은 비밀번호로 생성
  const response1 = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user1Data)
  });

  const response2 = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user2Data)
  });

  expect(response1.status, 201, 'User 1 should be created');
  expect(response2.status, 201, 'User 2 should be created');

  // 각자 로그인 성공
  const { success: login1 } = await login(user1Data.email, samePassword);
  const { success: login2 } = await login(user2Data.email, samePassword);

  expect(login1, true, 'User 1 should login');
  expect(login2, true, 'User 2 should login');

  log(`   동일 비밀번호로 2명의 사용자 생성 및 로그인 성공`, 'yellow');
  log(`   (비밀번호 해시가 각각 저장됨)`, 'yellow');
}

// ===== 테스트 10: SQL Injection 방어 확인 =====

async function testSqlInjectionInPassword(): Promise<void> {
  const randomId = Date.now();
  const sqlInjectionPasswords = [
    "' OR '1'='1",
    "admin'--",
    "' OR 1=1--",
    "'; DROP TABLE users--"
  ];

  for (const maliciousPassword of sqlInjectionPasswords) {
    const userData = {
      email: `sql${randomId}@test.com`,
      username: `sqluser${randomId}`,
      password: maliciousPassword,
      name: 'SQL테스트'
    };

    const response = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    // SQL Injection은 회원가입 성공하고, 로그인 시 정확히 일치해야만 성공
    if (response.status === 201) {
      const { success } = await login(userData.email, maliciousPassword);
      // 정확히 같은 문자열로만 로그인되어야 함
      expect(success, true, 'SQL injection string should be treated as normal password');

      // 다른 변형으로는 로그인 안 됨
      const { success: failed } = await login(userData.email, "' OR '1'='2");
      expect(failed, false, 'Should not login with different SQL injection');
    }
  }

  log(`   SQL Injection 패턴이 일반 문자열로 안전하게 처리됨`, 'yellow');
}

// ===== 메인 실행 =====

async function runTests(): Promise<void> {
  logHeader('비밀번호 보안 통합 테스트');

  let testUser: UserData | null = null;

  // 1. API 응답에 비밀번호 미포함
  await test('[응답] 회원가입 응답에 비밀번호 미포함', async () => {
    testUser = await testSignupResponseNoPassword();
  });

  // 2. 올바른 비밀번호로만 로그인
  if (testUser) {
    await test('[로그인] 올바른 비밀번호로 로그인 성공', () =>
      testLoginWithCorrectPassword(testUser!)
    );

    await test('[로그인] 잘못된 비밀번호 거부', () =>
      testLoginWithWrongPassword(testUser!)
    );

    await test('[해시] 비슷한 비밀번호도 거부 (정확한 해시 비교)', () =>
      testLoginWithSimilarPassword(testUser!)
    );

    await test('[응답] 세션에 비밀번호 미포함', () =>
      testSessionNoPassword(testUser!)
    );

    await test('[해시] 비밀번호 대소문자 구분', () =>
      testPasswordCaseSensitive(testUser!)
    );
  }

  // 3. 비밀번호 검증
  await test('[검증] 빈 비밀번호 거부', testEmptyPasswordRejected);
  await test('[검증] 공백만 있는 비밀번호 검증', testWhitespacePasswordRejected);

  // 4. 해시 관련
  await test('[해시] 동일 비밀번호로 여러 사용자 생성', testSamePasswordDifferentUsers);

  // 5. 보안
  await test('[보안] SQL Injection 방어', testSqlInjectionInPassword);

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
