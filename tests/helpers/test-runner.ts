import type { TestResult, TestResults } from './types';
import { log, logSuccess, logError, logHeader } from './logger';

// 테스트 결과 저장
export const results: TestResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// 테스트 헬퍼 함수
export async function test(name: string, fn: () => Promise<void>): Promise<void> {
  try {
    log(`\n🧪 ${name}`, 'blue');
    await fn();
    logSuccess('통과');
    results.passed++;
    results.tests.push({ name, status: 'PASS' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logError(`실패: ${errorMessage}`);
    results.failed++;
    results.tests.push({ name, status: 'FAIL', error: errorMessage });
  }
}

// 어설션 함수
export function expect<T>(actual: T, expected: T, message?: string): void {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

// 테스트 결과 출력
export function printResults(): void {
  logHeader('테스트 결과');

  results.tests.forEach(testResult => {
    const icon = testResult.status === 'PASS' ? '✅' : '❌';
    const color = testResult.status === 'PASS' ? 'green' : 'red';
    log(`${icon} ${testResult.name}`, color);
    if (testResult.error) {
      log(`   └─ ${testResult.error}`, 'yellow');
    }
  });

  log(`\n총 ${results.passed + results.failed}개 테스트`, 'blue');
  logSuccess(`통과: ${results.passed}`);
  logError(`실패: ${results.failed}`);
}

// 테스트 결과에 따라 프로세스 종료
export function exitWithResults(): void {
  process.exit(results.failed > 0 ? 1 : 0);
}

// 결과 초기화 (여러 테스트 파일 실행 시)
export function resetResults(): void {
  results.passed = 0;
  results.failed = 0;
  results.tests = [];
}
