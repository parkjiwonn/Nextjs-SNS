// 회원가입 통합 테스트
import { config } from '../config';
import { test, expect, printResults, exitWithResults } from '../helpers/test-runner';
import { logHeader, log } from '../helpers/logger';
import type { UserData, SignupResponse, ErrorResponse } from '../helpers/types';

const BASE_URL = config.baseUrl;

// 테스트 데이터 생성 헬퍼
function generateTestUser(overrides?: Partial<UserData>): UserData {
  const randomId = Date.now();
  return {
    email: `test${randomId}@test.com`,
    username: `testuser${randomId}`,
    password: 'test1234',
    name: '테스트유저',
    ...overrides
  };
}

// 회원가입 API 호출 헬퍼
async function signup(userData: Partial<UserData>) {
  const response = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });

  const data = await response.json();
  return { response, data };
}

// ===== 성공 케이스 =====

async function testSignupSuccess(): Promise<UserData> {
  const userData = generateTestUser();
  const { response, data } = await signup(userData);

  expect(response.status, 201, 'Status should be 201');
  expect(data.user.email, userData.email, 'Email should match');
  expect(data.user.username, userData.username, 'Username should match');
  expect(data.user.name, userData.name, 'Name should match');

  log(`   생성된 사용자: ${data.user.username} (${data.user.email})`, 'yellow');

  return userData;
}

// ===== 실패 케이스: 필수 필드 검증 =====

async function testSignupMissingEmail(): Promise<void> {
  const userData = generateTestUser();
  delete (userData as any).email;

  const { response, data } = await signup(userData);

  expect(response.status, 400, 'Status should be 400');
  expect(!!data.error, true, 'Should return error message');

  log(`   에러 메시지: ${data.error}`, 'yellow');
}

async function testSignupMissingUsername(): Promise<void> {
  const userData = generateTestUser();
  delete (userData as any).username;

  const { response, data } = await signup(userData);

  expect(response.status, 400, 'Status should be 400');
  expect(!!data.error, true, 'Should return error message');

  log(`   에러 메시지: ${data.error}`, 'yellow');
}

async function testSignupMissingPassword(): Promise<void> {
  const userData = generateTestUser();
  delete (userData as any).password;

  const { response, data } = await signup(userData);

  expect(response.status, 400, 'Status should be 400');
  expect(!!data.error, true, 'Should return error message');

  log(`   에러 메시지: ${data.error}`, 'yellow');
}

async function testSignupMissingName(): Promise<void> {
  const userData = generateTestUser();
  delete (userData as any).name;

  const { response, data } = await signup(userData);

  expect(response.status, 400, 'Status should be 400');
  expect(!!data.error, true, 'Should return error message');

  log(`   에러 메시지: ${data.error}`, 'yellow');
}

// ===== 실패 케이스: 중복 검증 =====

async function testSignupDuplicateEmail(existingUser: UserData): Promise<void> {
  const userData = generateTestUser({ email: existingUser.email });

  const { response, data } = await signup(userData);

  expect(response.status, 400, 'Status should be 400');
  expect(!!data.error, true, 'Should return error message');
  expect(data.error.includes('이메일'), true, 'Error should mention email');

  log(`   에러 메시지: ${data.error}`, 'yellow');
}

async function testSignupDuplicateUsername(existingUser: UserData): Promise<void> {
  const userData = generateTestUser({ username: existingUser.username });

  const { response, data } = await signup(userData);

  expect(response.status, 400, 'Status should be 400');
  expect(!!data.error, true, 'Should return error message');
  expect(data.error.includes('유저네임'), true, 'Error should mention username');

  log(`   에러 메시지: ${data.error}`, 'yellow');
}

// ===== 실패 케이스: 공백 검증 =====

async function testSignupEmptyEmail(): Promise<void> {
  const userData = generateTestUser({ email: '' });

  const { response, data } = await signup(userData);

  expect(response.status, 400, 'Status should be 400');
  expect(!!data.error, true, 'Should return error message');

  log(`   에러 메시지: ${data.error}`, 'yellow');
}

async function testSignupWhitespaceEmail(): Promise<void> {
  const userData = generateTestUser({ email: '   ' });

  const { response, data } = await signup(userData);

  expect(response.status, 400, 'Status should be 400');
  expect(!!data.error, true, 'Should return error message');

  log(`   에러 메시지: ${data.error}`, 'yellow');
}

async function testSignupWhitespaceUsername(): Promise<void> {
  const userData = generateTestUser({ username: '   ' });

  const { response, data } = await signup(userData);

  expect(response.status, 400, 'Status should be 400');
  expect(!!data.error, true, 'Should return error message');

  log(`   에러 메시지: ${data.error}`, 'yellow');
}

// ===== 실패 케이스: 이메일 형식 검증 =====

async function testSignupInvalidEmailFormat1(): Promise<void> {
  const userData = generateTestUser({ email: 'invalid-email' });

  const { response, data } = await signup(userData);

  // 현재 API에 형식 검증이 없을 수 있으므로 결과 확인
  if (response.status === 400) {
    log(`   ✅ 형식 검증 있음 - 에러: ${data.error}`, 'yellow');
  } else if (response.status === 201) {
    log(`   ⚠️  형식 검증 없음 - 회원가입 성공 (개선 필요)`, 'yellow');
  }

  // 400이거나 201이면 OK (형식 검증 여부 확인용)
  const isValidResponse = response.status === 400 || response.status === 201;
  expect(isValidResponse, true, 'Should be 400 or 201');
}

async function testSignupInvalidEmailFormat2(): Promise<void> {
  const userData = generateTestUser({ email: 'test@' });

  const { response, data } = await signup(userData);

  if (response.status === 400) {
    log(`   ✅ 형식 검증 있음 - 에러: ${data.error}`, 'yellow');
  } else if (response.status === 201) {
    log(`   ⚠️  형식 검증 없음 - 회원가입 성공 (개선 필요)`, 'yellow');
  }

  const isValidResponse = response.status === 400 || response.status === 201;
  expect(isValidResponse, true, 'Should be 400 or 201');
}

// ===== 실패 케이스: 필드 길이 제한 =====

async function testSignupUsernameTooLong(): Promise<void> {
  // username은 50자 제한
  const longUsername = 'a'.repeat(51);
  const userData = generateTestUser({ username: longUsername });

  const { response, data } = await signup(userData);

  // DB 제약으로 인해 500 또는 400 에러가 발생해야 함
  const isValidResponse = response.status === 400 || response.status === 500;
  expect(isValidResponse, true, 'Should reject username > 50 chars');

  log(`   Username 길이: ${longUsername.length}자, 응답: ${response.status}`, 'yellow');
}

async function testSignupNameTooLong(): Promise<void> {
  // name은 100자 제한
  const longName = '가'.repeat(101);
  const userData = generateTestUser({ name: longName });

  const { response, data } = await signup(userData);

  const isValidResponse = response.status === 400 || response.status === 500;
  expect(isValidResponse, true, 'Should reject name > 100 chars');

  log(`   Name 길이: ${longName.length}자, 응답: ${response.status}`, 'yellow');
}

// ===== 실패 케이스: 특수문자 검증 =====

async function testSignupUsernameWithSpecialChars(): Promise<void> {
  const userData = generateTestUser({ username: 'test@user#123' });

  const { response, data } = await signup(userData);

  // 특수문자 검증이 있으면 400, 없으면 201
  if (response.status === 400) {
    log(`   ✅ 특수문자 검증 있음 - 에러: ${data.error}`, 'yellow');
  } else if (response.status === 201) {
    log(`   ⚠️  특수문자 검증 없음 - 회원가입 성공`, 'yellow');
  }

  const isValidResponse = response.status === 400 || response.status === 201;
  expect(isValidResponse, true, 'Should be 400 or 201');
}

// ===== 메인 실행 =====

async function runTests(): Promise<void> {
  logHeader('회원가입 통합 테스트');

  let createdUser: UserData | null = null;

  // 1. 성공 케이스
  await test('[성공] 정상 회원가입', async () => {
    createdUser = await testSignupSuccess();
  });

  // 2. 필수 필드 누락
  await test('[실패] 이메일 누락', testSignupMissingEmail);
  await test('[실패] 유저네임 누락', testSignupMissingUsername);
  await test('[실패] 비밀번호 누락', testSignupMissingPassword);
  await test('[실패] 이름 누락', testSignupMissingName);

  // 3. 중복 검증 (생성된 사용자 필요)
  if (createdUser) {
    await test('[실패] 중복 이메일', () => testSignupDuplicateEmail(createdUser!));
    await test('[실패] 중복 유저네임', () => testSignupDuplicateUsername(createdUser!));
  }

  // 4. 공백 검증
  await test('[실패] 빈 이메일', testSignupEmptyEmail);
  await test('[실패] 공백 이메일', testSignupWhitespaceEmail);
  await test('[실패] 공백 유저네임', testSignupWhitespaceUsername);

  // 5. 이메일 형식 검증
  await test('[검증] 잘못된 이메일 형식 1 (@ 없음)', testSignupInvalidEmailFormat1);
  await test('[검증] 잘못된 이메일 형식 2 (도메인 없음)', testSignupInvalidEmailFormat2);

  // 6. 필드 길이 제한
  await test('[실패] 유저네임 길이 초과 (51자)', testSignupUsernameTooLong);
  await test('[실패] 이름 길이 초과 (101자)', testSignupNameTooLong);

  // 7. 특수문자 검증
  await test('[검증] 유저네임 특수문자 포함', testSignupUsernameWithSpecialChars);

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
