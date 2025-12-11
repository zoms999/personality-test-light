# 🚨 Prisma 오류 빠른 해결

## 문제

```
The column `test_attempts.language_code` does not exist
```

## 해결 방법 (3가지 중 선택)

### ⭐ 방법 1: 배치 파일 실행 (가장 쉬움)

```bash
# 더블클릭하거나 터미널에서 실행
fix-prisma.bat
```

### 방법 2: 수동 실행

```bash
# 1. 개발 서버 중지 (Ctrl + C)

# 2. Node.js 프로세스 종료
taskkill /F /IM node.exe

# 3. Prisma 재생성
npx prisma generate

# 4. 개발 서버 재시작
npm run dev
```

### 방법 3: 컴퓨터 재시작

1. 컴퓨터 재시작
2. `npx prisma generate`
3. `npm run dev`

## 왜 이런 일이?

데이터베이스는 업데이트되었지만, Prisma 클라이언트(TypeScript 코드)가
아직 재생성되지 않아서 새 컬럼을 인식하지 못합니다.

## 확인

재생성 후 오류가 사라지면 성공! ✅
