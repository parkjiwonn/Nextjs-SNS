# Jiwon SNS

소셜 네트워크 서비스 플랫폼 - Next.js 기반 풀스택 애플리케이션

## 프로젝트 개요

Jiwon SNS는 사용자들이 일상을 공유하고 소통할 수 있는 소셜 네트워크 플랫폼입니다.

## 기술 스택

### Frontend
- **Next.js 16** 
- **React 19** 
- **TypeScript**
- **Tailwind CSS**

### Backend
- **Next.js API Routes** 
- **NextAuth.js** 
- **Drizzle ORM** 

### Database & Storage
- **PostgreSQL** 
- **Supabase** - BaaS (Backend as a Service)
  - Database: PostgreSQL
  - Storage: 이미지 파일 저장

### API & Documentation
- **OpenAPI 3.0** 
- **Swagger UI** 
- **openapi-typescript** 
- **openapi-fetch** 

## 주요 기능 (+ 추후 업데이트 예정입니다.)

- ✅ 회원가입 / 로그인 (NextAuth.js)
- ✅ 게시글 작성 (텍스트 + 이미지)


## 시작하기

### 1. 필수 요구사항

- Node.js 20 이상
- npm 또는 yarn
- Supabase 계정 (무료)

### 2. 프로젝트 클론

```bash
git clone <repository-url>
cd jiwon-sns
```

### 3. 의존성 설치

```bash
npm install
```

### 4. 환경 변수 설정

`.env.local` 파일 생성:

```bash
# Database (Supabase - Session Pooler URL 사용!)
DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres

# NextAuth
NEXTAUTH_URL=http://localhost:3003
NEXTAUTH_SECRET=[생성된 시크릿 키]

# Supabase Storage
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
```

### 5. 데이터베이스 마이그레이션

```bash
# Drizzle 마이그레이션 생성
npm run db:generate

# 마이그레이션 실행
npm run db:push
```

### 6. 개발 서버 실행

```bash
npm run dev
```

서버가 `http://localhost:3003`에서 실행됩니다.

### 7. API 문서 확인

브라우저에서 `http://localhost:3003/api-docs` 접속하여 Swagger UI로 API 테스트 가능

## 사용 가능한 스크립트

```bash
# 개발 서버 실행 (포트 3003)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# ESLint 실행
npm run lint

# OpenAPI 타입 생성 (서버 실행 중이어야 함)
npm run generate:api

# 통합 테스트
npm run test:api          # API 연결 테스트
npm run test:signup       # 회원가입 테스트
npm run test:login        # 로그인 테스트
npm run test:session      # 세션 테스트
npm run test:password     # 비밀번호 보안 테스트
npm run test:integration  # 전체 통합 테스트
```

### 타입 재생성

API 스펙이 변경되면 타입을 재생성해야 합니다:

```bash
# 1. 개발 서버 실행 (별도 터미널)
npm run dev

# 2. 타입 생성 (새 터미널)
npm run generate:api
```

## 배포

### Vercel 배포

(+ 추후 업데이트 예정 입니다.)

### 환경 분리

- **개발 환경**: Supabase 개발용 프로젝트
- **프로덕션 환경**: Supabase 프로덕션용 프로젝트 (별도 생성)


## 참고 자료

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Drizzle ORM](https://orm.drizzle.team/)
- [NextAuth.js](https://next-auth.js.org/)
- [OpenAPI Specification](https://swagger.io/specification/)

## 라이선스

MIT

## 개발자

박지원
