import type { ColorType } from './types';

// 색상 출력을 위한 유틸리티
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
} as const;

export function log(message: string, color: ColorType = 'reset'): void {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

export function logSuccess(message: string): void {
  log(`✅ ${message}`, 'green');
}

export function logError(message: string): void {
  log(`❌ ${message}`, 'red');
}

export function logInfo(message: string): void {
  log(`ℹ️  ${message}`, 'blue');
}

export function logWarning(message: string): void {
  log(`⚠️  ${message}`, 'yellow');
}

export function logHeader(title: string): void {
  log('\n=================================', 'blue');
  log(`  ${title}`, 'blue');
  log('=================================', 'blue');
}
