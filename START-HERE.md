# 🚀 시작하기 - 플레이 스토어 배포

## ⚠️ 중요: 먼저 아이콘을 생성해야 합니다!

현재 PWA 검증에서 PNG 아이콘이 필요하다는 오류가 발생하고 있습니다.

## 📱 1단계: 아이콘 생성 (5분)

### 방법 A: 브라우저에서 생성 (가장 쉬움) ⭐

```bash
# 1. 개발 서버 실행
npm run dev
```

그 다음:
1. 브라우저에서 http://localhost:3000/generate-icons.html 열기
2. **"모든 아이콘 다운로드"** 버튼 클릭
3. 다운로드된 `icon-192.png`와 `icon-512.png` 파일 확인
4. 두 파일을 프로젝트의 `public` 폴더에 복사

### 방법 B: Icon Kitchen 사용 (더 전문적)

1. https://icon.kitchen/ 접속
2. 설정:
   - **Text**: "나" 입력
   - **Background**: #3b82f6 (파란색)
   - **Padding**: Medium
3. **Download** 클릭
4. 압축 파일 해제
5. `icon-192.png`와 `icon-512.png`를 `public` 폴더에 복사

### 방법 C: 기존 로고 변환

1. https://www.iloveimg.com/resize-image 접속
2. `public/oct_logo.jpg` 업로드
3. 크기 조정:
   - 192x192 → `icon-192.png`로 저장
   - 512x512 → `icon-512.png`로 저장
4. `public` 폴더에 복사

## ✅ 2단계: 아이콘 확인

```bash
npm run icons:check
```

다음과 같이 표시되어야 합니다:
```
public/
├── icon-192.png  ✅
└── icon-512.png  ✅
```

## 🏗️ 3단계: 빌드 테스트

```bash
npm run build
```

오류 없이 빌드되면 성공!

## 🌐 4단계: 웹 배포

### Vercel 배포 (권장):

```bash
# Vercel CLI 설치
npm install -g vercel

# 로그인
vercel login

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

**환경 변수 설정** (Vercel 대시보드에서):
- `DATABASE_URL`
- `NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY`

## 📦 5단계: TWA 생성

1. https://www.pwabuilder.com/ 접속
2. 배포된 URL 입력 (예: https://your-app.vercel.app)
3. **Start** 클릭
4. **Package For Stores** 클릭
5. **Android** 선택
6. 앱 정보 입력:
   - Package ID: `com.personality.test`
   - App name: `나를 찾아줘`
   - Theme color: `#3b82f6`
7. **Generate** 클릭
8. AAB 파일 다운로드

## 🏪 6단계: 플레이 스토어 제출

1. https://play.google.com/console 접속
2. 개발자 등록 ($25)
3. 새 앱 만들기
4. AAB 파일 업로드
5. 스크린샷 및 설명 추가
6. 검토 제출

자세한 내용은 `README-DEPLOYMENT.md` 참조

## 🎯 빠른 체크리스트

- [ ] 아이콘 생성 (icon-192.png, icon-512.png)
- [ ] `npm run icons:check` 실행하여 확인
- [ ] `npm run build` 성공
- [ ] Vercel 배포
- [ ] PWABuilder로 TWA 생성
- [ ] 플레이 스토어 제출

## 💡 팁

### 아이콘이 마음에 안 들면?
나중에 언제든 교체 가능합니다. 일단 임시로 생성하고 배포 후 개선하세요.

### PWA 테스트
배포 후 Chrome에서 주소창 오른쪽 "설치" 버튼이 보이면 성공!

### 자동 업데이트
PWA는 웹 앱 업데이트 시 자동으로 반영됩니다. 플레이 스토어 재제출 불필요!

## 🆘 문제 해결

### "아이콘을 찾을 수 없습니다" 오류
```bash
# 파일 위치 확인
dir public\icon-*.png

# 없으면 다시 생성
npm run dev
# http://localhost:3000/generate-icons.html
```

### 빌드 오류
```bash
# 캐시 삭제
rmdir /s /q .next
npm run build
```

### PWA 설치 버튼이 안 보임
- HTTPS 배포 확인
- manifest.json 경로 확인
- 브라우저 콘솔 에러 확인

## 📚 추가 문서

- `README-DEPLOYMENT.md` - 완전한 배포 가이드
- `ICON-GENERATION-GUIDE.md` - 아이콘 생성 상세 가이드
- `PWA-DEPLOYMENT-QUICK-START.md` - PWA 빠른 시작

## 🎉 시작하세요!

```bash
# 지금 바로 시작
npm run dev
```

그리고 http://localhost:3000/generate-icons.html 에서 아이콘을 생성하세요!

성공적인 배포를 응원합니다! 🚀
