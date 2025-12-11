# Prisma 클라이언트 오류 해결 방법

## 🔴 문제

```
The column `test_attempts.language_code` does not exist in the current database.
```

데이터베이스에는 컬럼이 있지만 Prisma 클라이언트가 인식하지 못하는 상황입니다.

## ✅ 해결 방법

### 1단계: 개발 서버 중지

현재 실행 중인 `npm run dev` 서버를 **완전히 중지**하세요.

- 터미널에서 `Ctrl + C` 누르기
- 모든 Next.js 프로세스 종료

### 2단계: Prisma 클라이언트 재생성

```bash
npx prisma generate
```

### 3단계: 개발 서버 재시작

```bash
npm run dev
```

## 🔧 대안 방법 (위 방법이 안 될 경우)

### 방법 1: 생성된 파일 삭제 후 재생성

```bash
# 1. 개발 서버 중지
# 2. 생성된 Prisma 클라이언트 삭제
rmdir /s /q src\generated\prisma

# 3. 재생성
npx prisma generate

# 4. 개발 서버 재시작
npm run dev
```

### 방법 2: 프로세스 강제 종료 (Windows)

```bash
# Node.js 프로세스 모두 종료
taskkill /F /IM node.exe

# Prisma 클라이언트 재생성
npx prisma generate

# 개발 서버 재시작
npm run dev
```

### 방법 3: 컴퓨터 재시작

가장 확실한 방법입니다:

1. 컴퓨터 재시작
2. `npx prisma generate` 실행
3. `npm run dev` 실행

## 📝 확인 사항

재생성 후 다음을 확인하세요:

```typescript
// src/generated/prisma/index.d.ts 파일에서 확인
export type TestAttempts = {
  id: string;
  session_id: string | null;
  user_name: string | null;
  birth_date: string | null;
  gender: string | null;
  user_email: string | null;
  phone_number: string | null;
  agreed_to_privacy: boolean;
  ip_address: string | null;
  user_agent: string | null;
  is_completed: boolean;
  completion_time: number | null;
  language_code: string; // ✅ 이 필드가 있어야 함
  created_at: Date;
  updated_at: Date;
};
```

## 🎯 왜 이런 일이 발생하나요?

1. **데이터베이스는 업데이트됨**: SQL 스크립트로 `language_code` 컬럼 추가
2. **Prisma 스키마는 업데이트됨**: `schema.prisma` 파일 수정
3. **Prisma 클라이언트는 업데이트 안 됨**: `npx prisma generate` 미실행

Prisma 클라이언트는 TypeScript 타입과 런타임 코드를 생성하는데,
스키마가 변경되면 반드시 재생성해야 합니다.

## ⚠️ 주의사항

- 개발 서버가 실행 중이면 Prisma 클라이언트를 재생성할 수 없습니다
- 파일이 잠겨있으면 `EPERM` 오류가 발생합니다
- 재생성 후 반드시 서버를 재시작해야 합니다

## 🚀 빠른 해결 (권장)

```bash
# 1. 개발 서버 중지 (Ctrl + C)

# 2. 재생성
npx prisma generate

# 3. 재시작
npm run dev
```

이제 `language_code` 컬럼을 정상적으로 사용할 수 있습니다! ✅
