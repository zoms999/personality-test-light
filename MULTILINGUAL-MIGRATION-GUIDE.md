# 다국어 데이터베이스 마이그레이션 가이드

## 📋 개요

이 가이드는 기존 단일 언어 데이터베이스를 다국어 지원 구조로 안전하게 마이그레이션하는 방법을 설명합니다.

## 🎯 변경 사항

### 1. 성격 유형 (Personality Types)

- **기존**: `personality_types` 테이블에 모든 텍스트 컬럼 포함
- **변경**: 텍스트 컬럼을 `personality_type_translations` 테이블로 분리

### 2. 질문 (Questions)

- **기존**: `questions` 테이블에 `question_text` 컬럼 포함
- **변경**: 질문 텍스트를 `question_translations` 테이블로 분리

### 3. 테스트 시도 (Test Attempts)

- **추가**: `language_code` 컬럼 추가 (기본값: 'ko')

## 🚀 마이그레이션 단계

### 사전 준비

1. **데이터베이스 백업**

   ```bash
   # PostgreSQL 백업 예시
   pg_dump -U username -d database_name > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Prisma 클라이언트 재생성 준비**
   ```bash
   npm install
   ```

### 단계 1: 번역 테이블 생성 및 데이터 이관

```bash
# SQL 스크립트 실행
psql -U username -d database_name -f prisma/migrations/add_multilingual_support.sql
```

이 스크립트는 다음을 수행합니다:

- ✅ `personality_type_translations` 테이블 생성
- ✅ `question_translations` 테이블 생성
- ✅ 기존 데이터를 한국어('ko')로 번역 테이블에 복사
- ✅ `test_attempts` 테이블에 `language_code` 컬럼 추가
- ⚠️ 기존 텍스트 컬럼은 **아직 삭제하지 않음** (안전을 위해)

### 단계 2: 데이터 검증

```sql
-- 성격 유형 번역 데이터 확인
SELECT
    pt.type_code,
    ptt.language_code,
    ptt.type_name,
    ptt.title
FROM personality_types pt
LEFT JOIN personality_type_translations ptt ON pt.id = ptt.personality_type_id
ORDER BY pt.type_code, ptt.language_code;

-- 질문 번역 데이터 확인
SELECT
    q.id,
    qt.language_code,
    LEFT(qt.question_text, 50) as question_preview
FROM questions q
LEFT JOIN question_translations qt ON q.id = qt.question_id
ORDER BY q.id, qt.language_code
LIMIT 10;

-- 모든 데이터가 이관되었는지 확인
SELECT
    (SELECT COUNT(*) FROM personality_types) as total_types,
    (SELECT COUNT(*) FROM personality_type_translations WHERE language_code = 'ko') as translated_types,
    (SELECT COUNT(*) FROM questions WHERE is_active = true) as total_questions,
    (SELECT COUNT(*) FROM question_translations WHERE language_code = 'ko') as translated_questions;
```

### 단계 3: Prisma 스키마 업데이트 및 클라이언트 재생성

```bash
# Prisma 클라이언트 재생성
npx prisma generate
```

### 단계 4: 애플리케이션 코드 업데이트

기존 코드를 새로운 다국어 구조에 맞게 수정합니다.

#### Before (기존 코드)

```typescript
// 질문 조회
const questions = await prisma.questions.findMany({
  where: { is_active: true },
  select: {
    id: true,
    question_text: true, // ❌ 더 이상 존재하지 않음
  },
});
```

#### After (새로운 코드)

```typescript
import { getActiveQuestions } from "@/lib/i18n/db-queries";

// 질문 조회 (다국어)
const questions = await getActiveQuestions("ko"); // ✅ 헬퍼 함수 사용
```

### 단계 5: 테스트

1. **개발 환경에서 테스트**

   ```bash
   npm run dev
   ```

2. **주요 기능 확인**

   - [ ] 테스트 시작 페이지 로드
   - [ ] 질문 목록 조회
   - [ ] 답변 제출
   - [ ] 결과 페이지 표시

3. **다국어 데이터 확인**

   ```typescript
   // 한국어 질문
   const questionsKo = await getActiveQuestions("ko");

   // 영어 질문 (추가 후)
   const questionsEn = await getActiveQuestions("en");
   ```

### 단계 6: 기존 컬럼 정리 (선택사항)

⚠️ **주의**: 모든 테스트가 완료되고 프로덕션에서 안정적으로 동작하는 것을 확인한 후에만 실행하세요!

```bash
# 기존 텍스트 컬럼 삭제
psql -U username -d database_name -f prisma/migrations/cleanup_old_columns.sql
```

## 📝 새로운 언어 추가하기

### 1. 영어 번역 추가 예시

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
    'Observer Type', -- 영어 번역
    'Observer',
    'Trust only what you see and experience',
    'You have a strong interest in nature, environment, and the universe...',
    '["Focused on areas of interest", "Methodical approach"]'::jsonb,
    '["Observant", "Patient", "Thorough"]'::jsonb,
    '["Slow-paced", "Reserved"]'::jsonb
FROM personality_types
WHERE type_code = 'OBSERVER';

-- 질문 영어 번역 추가
INSERT INTO question_translations (
    question_id,
    language_code,
    question_text
)
VALUES
    (1, 'en', 'I enjoy observing nature and natural phenomena.'),
    (2, 'en', 'I prefer to work at my own pace rather than rushing.');
```

### 2. 코드에서 언어 선택

```typescript
// 사용자 언어 설정에 따라 조회
const userLanguage = req.headers["accept-language"]?.startsWith("en")
  ? "en"
  : "ko";
const questions = await getActiveQuestions(userLanguage);
```

## 🔧 헬퍼 함수 사용법

### 질문 조회

```typescript
import { getActiveQuestions, getQuestion } from "@/lib/i18n/db-queries";

// 모든 활성 질문 조회
const questions = await getActiveQuestions("ko");

// 특정 질문 조회
const question = await getQuestion(1, "ko");
```

### 성격 유형 조회

```typescript
import {
  getPersonalityType,
  getAllPersonalityTypes,
} from "@/lib/i18n/db-queries";

// 특정 성격 유형 조회
const type = await getPersonalityType("OBSERVER", "ko");

// 모든 성격 유형 조회
const allTypes = await getAllPersonalityTypes("ko");
```

### 테스트 시도 생성

```typescript
import { createTestAttempt } from "@/lib/i18n/db-queries";

const attempt = await createTestAttempt({
  userName: "홍길동",
  userEmail: "test@example.com",
  languageCode: "ko", // 언어 정보 포함
});
```

### 테스트 결과 조회

```typescript
import { getTestResult } from "@/lib/i18n/db-queries";

const result = await getTestResult(attemptId, "ko");
```

## 🎨 API 라우트 업데이트 예시

### Before

```typescript
// src/app/api/test/questions/route.ts
export async function GET() {
  const questions = await prisma.questions.findMany({
    where: { is_active: true },
    select: {
      id: true,
      question_text: true, // ❌
    },
  });

  return NextResponse.json({ questions });
}
```

### After

```typescript
// src/app/api/test/questions/route.ts
import { getActiveQuestions } from "@/lib/i18n/db-queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get("lang") || "ko";

  const questions = await getActiveQuestions(lang as "ko" | "en" | "jp");

  return NextResponse.json({ questions });
}
```

## 🐛 트러블슈팅

### 문제: Prisma 클라이언트가 새 테이블을 인식하지 못함

```bash
# 해결: Prisma 클라이언트 재생성
npx prisma generate
```

### 문제: 번역 데이터가 없음

```sql
-- 해결: 데이터 이관 스크립트 재실행
-- 먼저 중복 확인
SELECT personality_type_id, language_code, COUNT(*)
FROM personality_type_translations
GROUP BY personality_type_id, language_code
HAVING COUNT(*) > 1;
```

### 문제: 기존 API가 동작하지 않음

- 모든 질문/성격 유형 조회 코드를 헬퍼 함수로 교체했는지 확인
- `question_text`, `type_name` 등 직접 참조하는 코드가 없는지 확인

## 📊 성능 최적화

### 인덱스 확인

```sql
-- 생성된 인덱스 확인
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN ('personality_type_translations', 'question_translations')
ORDER BY tablename, indexname;
```

### 쿼리 성능 모니터링

```sql
-- 느린 쿼리 확인
EXPLAIN ANALYZE
SELECT q.id, qt.question_text
FROM questions q
INNER JOIN question_translations qt ON q.id = qt.question_id
WHERE q.is_active = true AND qt.language_code = 'ko';
```

## ✅ 체크리스트

마이그레이션 완료 전 확인사항:

- [ ] 데이터베이스 백업 완료
- [ ] 번역 테이블 생성 완료
- [ ] 기존 데이터 이관 완료
- [ ] 데이터 검증 완료
- [ ] Prisma 클라이언트 재생성 완료
- [ ] 모든 API 라우트 업데이트 완료
- [ ] 개발 환경 테스트 완료
- [ ] 스테이징 환경 테스트 완료
- [ ] 프로덕션 배포 완료
- [ ] 프로덕션 모니터링 확인

## 📞 지원

문제가 발생하면:

1. 데이터베이스 백업에서 복구
2. 마이그레이션 로그 확인
3. 개발팀에 문의

---

**마지막 업데이트**: 2024-12-10
