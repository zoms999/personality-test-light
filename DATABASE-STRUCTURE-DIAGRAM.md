# 데이터베이스 구조 다이어그램

## 변경 전 (Before)

```
┌─────────────────────────────────┐
│   personality_types             │
├─────────────────────────────────┤
│ id (UUID, PK)                   │
│ type_code (VARCHAR)             │
│ type_name (VARCHAR) ❌          │
│ title (VARCHAR) ❌              │
│ theme_sentence (TEXT) ❌        │
│ description (TEXT) ❌           │
│ description_points (JSON) ❌    │
│ strength_keywords (JSON) ❌     │
│ weakness_keywords (JSON) ❌     │
│ created_at                      │
│ updated_at                      │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│   questions                     │
├─────────────────────────────────┤
│ id (INT, PK)                    │
│ personality_type_id (UUID, FK)  │
│ question_text (TEXT) ❌         │
│ question_order_in_type          │
│ is_active                       │
│ created_at                      │
│ updated_at                      │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│   test_attempts                 │
├─────────────────────────────────┤
│ id (UUID, PK)                   │
│ user_name                       │
│ user_email                      │
│ ... (기타 필드)                 │
│ created_at                      │
│ updated_at                      │
└─────────────────────────────────┘
```

## 변경 후 (After)

```
┌─────────────────────────────────┐
│   personality_types             │
├─────────────────────────────────┤
│ id (UUID, PK)                   │
│ type_code (VARCHAR)             │
│ created_at                      │
│ updated_at                      │
└─────────────────────────────────┘
           │
           │ 1:N
           ▼
┌─────────────────────────────────┐
│ personality_type_translations   │
├─────────────────────────────────┤
│ id (UUID, PK)                   │
│ personality_type_id (UUID, FK)  │
│ language_code (VARCHAR) ✅      │
│ type_name (VARCHAR) ✅          │
│ title (VARCHAR) ✅              │
│ theme_sentence (TEXT) ✅        │
│ description (TEXT) ✅           │
│ description_points (JSONB) ✅   │
│ strength_keywords (JSONB) ✅    │
│ weakness_keywords (JSONB) ✅    │
│ created_at                      │
│ updated_at                      │
│                                 │
│ UNIQUE(type_id, language_code)  │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│   questions                     │
├─────────────────────────────────┤
│ id (INT, PK)                    │
│ personality_type_id (UUID, FK)  │
│ question_order_in_type          │
│ is_active                       │
│ created_at                      │
│ updated_at                      │
└─────────────────────────────────┘
           │
           │ 1:N
           ▼
┌─────────────────────────────────┐
│   question_translations         │
├─────────────────────────────────┤
│ id (SERIAL, PK)                 │
│ question_id (INT, FK)           │
│ language_code (VARCHAR) ✅      │
│ question_text (TEXT) ✅         │
│ created_at                      │
│ updated_at                      │
│                                 │
│ UNIQUE(question_id, lang_code)  │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│   test_attempts                 │
├─────────────────────────────────┤
│ id (UUID, PK)                   │
│ user_name                       │
│ user_email                      │
│ language_code (VARCHAR) ✅ NEW  │
│ ... (기타 필드)                 │
│ created_at                      │
│ updated_at                      │
└─────────────────────────────────┘
```

## 데이터 흐름 (Data Flow)

### 질문 조회 (한국어)

```
1. 클라이언트 요청
   GET /api/test/questions?lang=ko

2. 서버 처리
   getActiveQuestions('ko')

3. 데이터베이스 쿼리
   SELECT q.*, qt.question_text
   FROM questions q
   JOIN question_translations qt
     ON q.id = qt.question_id
   WHERE q.is_active = true
     AND qt.language_code = 'ko'

4. 응답
   [
     { id: 1, question_text: "자연을 관찰하는 것을 좋아한다" },
     { id: 2, question_text: "..." }
   ]
```

### 질문 조회 (영어)

```
1. 클라이언트 요청
   GET /api/test/questions?lang=en

2. 서버 처리
   getActiveQuestions('en')

3. 데이터베이스 쿼리
   SELECT q.*, qt.question_text
   FROM questions q
   JOIN question_translations qt
     ON q.id = qt.question_id
   WHERE q.is_active = true
     AND qt.language_code = 'en'

4. 응답
   [
     { id: 1, question_text: "I enjoy observing nature" },
     { id: 2, question_text: "..." }
   ]
```

## 인덱스 구조

```
personality_type_translations
├── PRIMARY KEY (id)
├── UNIQUE INDEX (personality_type_id, language_code)
└── INDEX (language_code)

question_translations
├── PRIMARY KEY (id)
├── UNIQUE INDEX (question_id, language_code)
└── INDEX (language_code)

test_attempts
└── INDEX (language_code)
```

## 외래 키 관계

```
personality_type_translations.personality_type_id
  → personality_types.id (CASCADE DELETE)

question_translations.question_id
  → questions.id (CASCADE DELETE)
```

## 데이터 예시

### personality_types

```
| id   | type_code |
|------|-----------|
| uuid1| OBSERVER  |
| uuid2| EDUCATOR  |
```

### personality_type_translations

```
| id   | type_id | lang | type_name | title    |
|------|---------|------|-----------|----------|
| uuid3| uuid1   | ko   | 관찰형    | 관찰형   |
| uuid4| uuid1   | en   | Observer  | Observer |
| uuid5| uuid2   | ko   | 교육형    | 교육형   |
| uuid6| uuid2   | en   | Educator  | Educator |
```

### questions

```
| id | type_id | order | is_active |
|----|---------|-------|-----------|
| 1  | uuid1   | 1     | true      |
| 2  | uuid1   | 2     | true      |
```

### question_translations

```
| id | question_id | lang | question_text                    |
|----|-------------|------|----------------------------------|
| 1  | 1           | ko   | 자연을 관찰하는 것을 좋아한다    |
| 2  | 1           | en   | I enjoy observing nature         |
| 3  | 2           | ko   | 천천히 일하는 것을 선호한다      |
| 4  | 2           | en   | I prefer to work at my own pace  |
```

## 장점

✅ **확장성**: 새 언어 추가가 쉬움
✅ **유지보수**: 번역만 별도 관리
✅ **성능**: 인덱스로 최적화
✅ **무결성**: 외래 키로 데이터 보호
✅ **유연성**: 언어별 독립적 업데이트

## 마이그레이션 안전성

✅ **데이터 보존**: 기존 데이터 자동 이관
✅ **롤백 가능**: 백업으로 복구 가능
✅ **점진적 전환**: 기존 컬럼 유지 가능
✅ **검증 가능**: 자동 검증 스크립트 제공
