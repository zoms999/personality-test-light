# 다국어 데이터베이스 구현 완료 요약

## 📦 생성된 파일

### 1. 마이그레이션 스크립트

- ✅ `prisma/migrations/add_multilingual_support.sql` - 메인 마이그레이션 스크립트
- ✅ `prisma/migrations/cleanup_old_columns.sql` - 기존 컬럼 정리 스크립트

### 2. Prisma 스키마

- ✅ `prisma/schema.prisma` - 업데이트됨 (새로운 번역 테이블 포함)

### 3. 헬퍼 함수

- ✅ `src/lib/i18n/db-queries.ts` - 다국어 데이터베이스 조회 헬퍼 함수

### 4. API 예시

- ✅ `src/app/api/test/questions-multilingual/route.ts` - 다국어 질문 조회 API
- ✅ `src/app/api/test/personality-types-multilingual/route.ts` - 다국어 성격 유형 조회 API

### 5. 검증 스크립트

- ✅ `scripts/verify-multilingual-migration.ts` - 마이그레이션 검증 스크립트

### 6. 문서

- ✅ `MULTILINGUAL-MIGRATION-GUIDE.md` - 상세 마이그레이션 가이드
- ✅ `MULTILINGUAL-QUICK-REFERENCE.md` - 빠른 참조 가이드
- ✅ `MULTILINGUAL-IMPLEMENTATION-SUMMARY.md` - 이 문서

## 🎯 주요 변경사항

### 데이터베이스 구조

#### 1. 성격 유형 (Personality Types)

```
기존: personality_types (모든 텍스트 포함)
변경: personality_types (메타데이터만) + personality_type_translations (다국어 텍스트)
```

#### 2. 질문 (Questions)

```
기존: questions (question_text 포함)
변경: questions (메타데이터만) + question_translations (다국어 텍스트)
```

#### 3. 테스트 시도 (Test Attempts)

```
추가: language_code 컬럼 (기본값: 'ko')
```

### 새로운 테이블

#### personality_type_translations

- `id` (UUID, PK)
- `personality_type_id` (UUID, FK)
- `language_code` (VARCHAR(5)) - 'ko', 'en', 'jp' 등
- `type_name` (VARCHAR(100))
- `title` (VARCHAR(500))
- `theme_sentence` (TEXT)
- `description` (TEXT)
- `description_points` (JSONB)
- `strength_keywords` (JSONB)
- `weakness_keywords` (JSONB)
- `created_at`, `updated_at`

#### question_translations

- `id` (SERIAL, PK)
- `question_id` (INT, FK)
- `language_code` (VARCHAR(5))
- `question_text` (TEXT)
- `created_at`, `updated_at`

## 🚀 실행 순서

### 1단계: 데이터베이스 백업

```bash
pg_dump -U username -d database_name > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2단계: 마이그레이션 실행

```bash
psql -U username -d database_name -f prisma/migrations/add_multilingual_support.sql
```

### 3단계: Prisma 클라이언트 재생성

```bash
npx prisma generate
```

### 4단계: 검증

```bash
npx ts-node scripts/verify-multilingual-migration.ts
```

### 5단계: 기존 컬럼 정리 (선택사항, 검증 후)

```bash
psql -U username -d database_name -f prisma/migrations/cleanup_old_columns.sql
```

## 💡 사용 예시

### Before (기존 코드)

```typescript
// ❌ 더 이상 작동하지 않음
const questions = await prisma.questions.findMany({
  where: { is_active: true },
  select: {
    id: true,
    question_text: true, // 컬럼이 없음
  },
});
```

### After (새로운 코드)

```typescript
// ✅ 헬퍼 함수 사용
import { getActiveQuestions } from "@/lib/i18n/db-queries";

const questions = await getActiveQuestions("ko");
// 또는
const questionsEn = await getActiveQuestions("en");
```

## 📚 주요 헬퍼 함수

```typescript
// 질문 관련
getActiveQuestions(languageCode: 'ko' | 'en' | 'jp')
getQuestion(questionId: number, languageCode: 'ko' | 'en' | 'jp')

// 성격 유형 관련
getPersonalityType(typeCode: string, languageCode: 'ko' | 'en' | 'jp')
getAllPersonalityTypes(languageCode: 'ko' | 'en' | 'jp')

// 테스트 관련
createTestAttempt({ ...data, languageCode: 'ko' })
getTestResult(attemptId: string, languageCode: 'ko' | 'en' | 'jp')
```

## 🔍 데이터 검증 쿼리

### 번역 현황 확인

```sql
-- 성격 유형 번역 현황
SELECT language_code, COUNT(*) as count
FROM personality_type_translations
GROUP BY language_code;

-- 질문 번역 현황
SELECT language_code, COUNT(*) as count
FROM question_translations
GROUP BY language_code;
```

### 누락된 번역 찾기

```sql
-- 영어 번역이 없는 성격 유형
SELECT pt.type_code
FROM personality_types pt
LEFT JOIN personality_type_translations ptt
    ON pt.id = ptt.personality_type_id
    AND ptt.language_code = 'en'
WHERE ptt.id IS NULL;
```

## 🌍 새 언어 추가 방법

### 1. SQL로 번역 데이터 추가

```sql
-- 영어 번역 추가 예시
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
    'English description...',
    '["Point 1", "Point 2"]'::jsonb,
    '["Strength 1"]'::jsonb,
    '["Weakness 1"]'::jsonb
FROM personality_types
WHERE type_code = 'OBSERVER';
```

### 2. 코드에서 사용

```typescript
const questionsEn = await getActiveQuestions("en");
const typesJp = await getAllPersonalityTypes("jp");
```

## ⚠️ 주의사항

### 1. 데이터 안전성

- ✅ 기존 데이터는 자동으로 한국어('ko')로 이관됩니다
- ✅ 기존 컬럼은 즉시 삭제되지 않습니다 (안전을 위해)
- ⚠️ 검증 후 `cleanup_old_columns.sql`로 정리 가능

### 2. 성능

- ✅ 모든 번역 테이블에 인덱스가 자동 생성됩니다
- ✅ `language_code`에 인덱스가 있어 조회 성능이 최적화됩니다

### 3. 데이터 무결성

- ✅ 외래 키 제약조건으로 데이터 무결성 보장
- ✅ UNIQUE 인덱스로 중복 번역 방지
- ✅ CASCADE DELETE로 관련 데이터 자동 정리

## 🔧 트러블슈팅

### 문제: Prisma 클라이언트 오류

```bash
# 해결
npx prisma generate
```

### 문제: 번역 데이터 없음

```sql
-- 확인
SELECT COUNT(*) FROM personality_type_translations WHERE language_code = 'ko';

-- 재실행
-- prisma/migrations/add_multilingual_support.sql 다시 실행
```

### 문제: 타입 오류

```typescript
// ❌ 잘못됨
const lang: string = "ko";

// ✅ 올바름
import type { LanguageCode } from "@/lib/i18n/db-queries";
const lang: LanguageCode = "ko";
```

## 📊 마이그레이션 체크리스트

- [ ] 데이터베이스 백업 완료
- [ ] `add_multilingual_support.sql` 실행
- [ ] `npx prisma generate` 실행
- [ ] 검증 스크립트 실행 (`verify-multilingual-migration.ts`)
- [ ] 모든 API 라우트 업데이트
- [ ] 개발 환경 테스트
- [ ] 스테이징 환경 테스트
- [ ] 프로덕션 배포
- [ ] 프로덕션 모니터링
- [ ] (선택) `cleanup_old_columns.sql` 실행

## 🎓 학습 자료

- **상세 가이드**: `MULTILINGUAL-MIGRATION-GUIDE.md`
- **빠른 참조**: `MULTILINGUAL-QUICK-REFERENCE.md`
- **API 예시**: `src/app/api/test/*-multilingual/route.ts`
- **헬퍼 함수**: `src/lib/i18n/db-queries.ts`

## 📞 지원

문제가 발생하면:

1. 검증 스크립트 실행: `npx ts-node scripts/verify-multilingual-migration.ts`
2. 트러블슈팅 가이드 확인: `MULTILINGUAL-MIGRATION-GUIDE.md`
3. 데이터베이스 백업에서 복구

---

**구현 완료일**: 2024-12-10
**버전**: 1.0.0
**상태**: ✅ 준비 완료
