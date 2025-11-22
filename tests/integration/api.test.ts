// API 통합 테스트
import { config } from '../config';
import { test, expect, printResults, exitWithResults } from '../helpers/test-runner';
import { logHeader, log } from '../helpers/logger';
import type { UserData, SignupResponse, ErrorResponse, DbTestResponse } from '../helpers/types';

const BASE_URL = config.baseUrl;

// 1. DB 연결 테스트
async function testDbConnection(): Promise<void> {
  const response = await fetch(`${BASE_URL}/api/test-db`);
  const data: DbTestResponse = await response.json();

  expect(response.status, 200, 'Status should be 200');
  expect(data.success, true, 'DB connection should be successful');

  log(`   DB 연결 상태: ${data.message}`, 'yellow');
}

// 2. 회원가입 테스트 - 성공 케이스
async function testSignupSuccess(): Promise<UserData> {
  const randomId = Date.now();
  const userData: UserData = {
    email: `test${randomId}@test.com`,
    username: `testuser${randomId}`,
    password: 'test1234',
    name: '테스트유저'
  };

  const response = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });

  const data: SignupResponse = await response.json();

  expect(response.status, 201, 'Status should be 201');
  expect(data.user.email, userData.email, 'Email should match');
  expect(data.user.username, userData.username, 'Username should match');

  log(`   생성된 사용자: ${data.user.username} (${data.user.email})`, 'yellow');

  return userData;
}

// 3. 회원가입 테스트 - 필수 필드 누락
async function testSignupMissingFields(): Promise<void> {
  const response = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@test.com' }) // 필드 누락
  });

  const data: ErrorResponse = await response.json();

  expect(response.status, 400, 'Status should be 400');
  expect(!!data.error, true, 'Should return error message');

  log(`   에러 메시지: ${data.error}`, 'yellow');
}

// 4. 회원가입 테스트 - 중복 이메일
async function testSignupDuplicateEmail(existingUser: UserData): Promise<void> {
  const response = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: existingUser.email, // 중복 이메일
      username: 'newuser123',
      password: 'test1234',
      name: '새유저'
    })
  });

  const data: ErrorResponse = await response.json();

  expect(response.status, 400, 'Status should be 400');
  expect(!!data.error, true, 'Should return error message');

  log(`   에러 메시지: ${data.error}`, 'yellow');
}

// 5. 게시글 작성 테스트 - 인증 없이 (실패해야 함)
async function testPostWithoutAuth(): Promise<void> {
  const formData = new FormData();
  formData.append('content', '테스트 게시글');

  const response = await fetch(`${BASE_URL}/api/posts`, {
    method: 'POST',
    body: formData
  });

  const data: ErrorResponse = await response.json();

  expect(response.status, 401, 'Status should be 401');
  expect(!!data.error, true, 'Should return error message');

  log(`   에러 메시지: ${data.error}`, 'yellow');
}

// 메인 실행
async function runTests(): Promise<void> {
  logHeader('SNS API 테스트 시작');

  let createdUser: UserData | null = null;

  // 테스트 실행
  await test('1. DB 연결 테스트', testDbConnection);

  await test('2. 회원가입 - 성공', async () => {
    createdUser = await testSignupSuccess();
  });

  await test('3. 회원가입 - 필수 필드 누락', testSignupMissingFields);

  if (createdUser) {
    await test('4. 회원가입 - 중복 이메일', () => testSignupDuplicateEmail(createdUser!));
  }

  await test('5. 게시글 작성 - 인증 없이 시도', testPostWithoutAuth);

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
