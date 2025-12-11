# 다국어 데이터베이스 빠른 참조 가이드

## 🚀 빠른 시작

### 1. 마이그레이션 실행 (한 번만)

```bash
# 1. 데이터베이스 백업
pg_dump -U username -d database_name > backup.sql

# 2. 마이그레이션 실행
psql -U username -d database_name -f prisma/migrations/add_multilingual_support.sql

# 3. Prisma 클라이언트 재생성
npx prisma generate
```

### 2. 코드 업데이트

```typescript
// ❌ 기존 방식 (더 이상 작동하지 않음)
const questions = await prisma.questions.findMany({
  select: { question_text: true },
});

// ✅ 새로운 방식
import { getActiveQuestions } from "@/lib/i18n/db-queries";
const questions = await getActiveQuestions("ko");
```

## 📚 주요 함수

### 질문 관련

```typescript
import { getActiveQuestions, getQuestion } from "@/lib/i18n/db-queries";

// 모든 활성 질문 조회
const questions = await getActiveQuestions("ko");
// 반환: { id, question_text, personality_type, ... }[]

// 특정 질문 조회
const question = await getQuestion(1, "ko");
// 반환: { id, question_text, ... } | null
```

### 성격 유형 관련

```typescript
import {
  getPersonalityType,
  getAllPersonalityTypes,
} from "@/lib/i18n/db-queries";

// 특정 성격 유형 조회
const type = await getPersonalityType("OBSERVER", "ko");
// 반환: { type_code, type_name, title, description, ... } | null

// 모든 성격 유형 조회
const allTypes = await getAllPersonalityTypes("ko");
// 반환: { type_code, type_name, title, ... }[]
```

### 테스트 관련

```typescript
import { createTestAttempt, getTestResult } from "@/lib/i18n/db-queries";

// 테스트 시도 생성 (언어 정보 포함)
const attempt = await createTestAttempt({
  userName: "홍길동",
  userEmail: "test@example.com",
  languageCode: "ko", // 중요!
});

// 테스트 결과 조회
const result = await getTestResult(attemptId, "ko");
```

## 🌍 지원 언어

```typescript
type LanguageCode = "ko" | "en" | "jp";

// 기본값: 'ko' (한국어)
```

## 📝 새 언어 추가하기

### SQL로 직접 추가

```sql
-- 성격 유형 영어 번역 추가
INSERT INTO personality_type_translations (
    personality_type_id,
    language_code,
    type_name,
    title,
    theme_sentence,
    description,
    description_points,
    strength_keywords,
    weakness_keywords
)
SELECT
    id,
    'en',
    'Observer Type',
    'Observer',
    'Trust only what you see',
    'Description in English...',
    '["Point 1", "Point 2"]'::jsonb,
    '["Strength 1"]'::jsonb,
    '["Weakness 1"]'::jsonb
FROM personality_types
WHERE type_code = 'OBSERVER';

-- 질문 영어 번역 추가
INSERT INTO question_translations (question_id, language_code, question_text)
VALUES (1, 'en', 'I enjoy observing nature.');
```

## 🔍 데이터 확인 쿼리

```sql
-- 번역 현황 확인
SELECT
    language_code,
    COUNT(*) as translation_count
FROM personality_type_translations
GROUP BY language_code;

-- 누락된 번역 찾기
SELECT pt.type_code
FROM personality_types pt
LEFT JOIN personality_type_translations ptt
    ON pt.id = ptt.personality_type_id
    AND ptt.language_code = 'en'
WHERE ptt.id IS NULL;
```

## 🎯 API 라우트 예시

### 질문 조회 API

```typescript
// src/app/api/test/questions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getActiveQuestions } from "@/lib/i18n/db-queries";

export async function GET(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get("lang") || "ko";
  const questions = await getActiveQuestions(lang as "ko" | "en" | "jp");

  return NextResponse.json({
    success: true,
    data: { questions },
  });
}
```

### 테스트 시작 API

```typescript
// src/app/api/test/start/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createTestAttempt } from "@/lib/i18n/db-queries";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const lang = body.languageCode || "ko";

  const attempt = await createTestAttempt({
    ...body,
    languageCode: lang,
  });

  return NextResponse.json({
    success: true,
    data: { attempt_id: attempt.id },
  });
}
```

## 🐛 일반적인 문제

### 문제 1: "column does not exist" 오류

```bash
# 해결: Prisma 클라이언트 재생성
npx prisma generate
```

### 문제 2: 번역 데이터가 없음

```sql
-- 확인
SELECT COUNT(*) FROM personality_type_translations WHERE language_code = 'ko';

-- 재실행
-- prisma/migrations/add_multilingual_support.sql 다시 실행
```

### 문제 3: 타입 오류

```typescript
// ❌ 잘못된 타입
const lang: string = "ko";

// ✅ 올바른 타입
import type { LanguageCode } from "@/lib/i18n/db-queries";
const lang: LanguageCode = "ko";
```

## 📊 데이터베이스 구조

### 변경 전

```
personality_types
├── id
├── type_code
├── type_name ❌
├── title ❌
├── description ❌
└── ...
```

### 변경 후

```
personality_types          personality_type_translations
├── id                     ├── id
├── type_code              ├── personality_type_id (FK)
└── ...                    ├── language_code
                           ├── type_name ✅
                           ├── title ✅
                           ├── description ✅
                           └── ...
```

## ✅ 체크리스트

개발 시 확인사항:

- [ ] 모든 질문 조회에 `getActiveQuestions()` 사용
- [ ] 모든 성격 유형 조회에 `getPersonalityType()` 또는 `getAllPersonalityTypes()` 사용
- [ ] 테스트 생성 시 `languageCode` 포함
- [ ] API에서 `lang` 파라미터 처리
- [ ] 타입 안전성 확인 (`LanguageCode` 사용)

## 🔗 관련 파일

- **마이그레이션 스크립트**: `prisma/migrations/add_multilingual_support.sql`
- **헬퍼 함수**: `src/lib/i18n/db-queries.ts`
- **Prisma 스키마**: `prisma/schema.prisma`
- **상세 가이드**: `MULTILINGUAL-MIGRATION-GUIDE.md`

---

**빠른 도움말**: 문제가 있으면 `MULTILINGUAL-MIGRATION-GUIDE.md`의 트러블슈팅 섹션을 확인하세요.
