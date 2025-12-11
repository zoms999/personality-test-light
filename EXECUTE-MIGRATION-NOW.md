# 🚀 다국어 마이그레이션 실행 가이드

## 지금 바로 실행하기

### 1️⃣ 데이터베이스 백업 (필수!)

```bash
# PostgreSQL 백업
pg_dump -U your_username -d your_database > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2️⃣ 마이그레이션 실행

```bash
# SQL 스크립트 실행
psql -U your_username -d your_database -f prisma/migrations/add_multilingual_support.sql
```

### 3️⃣ Prisma 클라이언트 재생성

```bash
npm run prisma:generate
```

### 4️⃣ 검증

```bash
npm run migration:verify
```

### 5️⃣ 개발 서버 시작 및 테스트

```bash
npm run dev
```

## ✅ 성공 확인

검증 스크립트가 모두 ✅로 표시되면 성공!

## 📚 추가 문서

- 상세 가이드: `MULTILINGUAL-MIGRATION-GUIDE.md`
- 빠른 참조: `MULTILINGUAL-QUICK-REFERENCE.md`
- 구현 요약: `MULTILINGUAL-IMPLEMENTATION-SUMMARY.md`
