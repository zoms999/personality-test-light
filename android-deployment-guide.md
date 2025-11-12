# 구글 플레이 스토어 배포 가이드

이 프로젝트는 Next.js 기반 웹 애플리케이션으로, API 라우트와 데이터베이스를 사용합니다.
구글 플레이 스토어에 배포하기 위한 두 가지 방법을 제공합니다.

## 방법 1: PWA (Progressive Web App) - 권장

PWA는 웹 앱을 네이티브 앱처럼 사용할 수 있게 해주며, 구글 플레이 스토어에도 배포 가능합니다.

### 장점
- 기존 코드 수정 최소화
- API 라우트와 서버 기능 모두 사용 가능
- 자동 업데이트
- 설치 용량 작음

### 단계

1. **PWA 설정 추가** (이미 구성됨)
   - `public/manifest.json` 생성
   - Service Worker 설정
   - 아이콘 준비

2. **웹 앱 배포**
   - Vercel, Netlify 등에 배포
   - HTTPS 필수

3. **TWA (Trusted Web Activity)로 플레이 스토어 배포**
   - Bubblewrap 또는 PWABuilder 사용
   - 명령어: `npx @bubblewrap/cli init --manifest=https://your-domain.com/manifest.json`

## 방법 2: Capacitor + 백엔드 분리

현재 설치된 Capacitor를 사용하되, 백엔드는 별도로 배포합니다.

### 필요 작업

1. **백엔드 API 분리**
   - API 라우트를 별도 서버로 배포 (Vercel, Railway 등)
   - 환경 변수로 API URL 설정

2. **프론트엔드 빌드**
   ```bash
   npm run build
   npx cap sync
   npx cap open android
   ```

3. **Android Studio에서 APK/AAB 빌드**

## 현재 프로젝트 상태

- ✅ Capacitor 설치 완료
- ✅ Android 플랫폼 추가 완료
- ⏳ PWA 설정 필요
- ⏳ 앱 아이콘 및 스플래시 스크린 필요
- ⏳ 서명 키 생성 필요

## 다음 단계

어떤 방법을 선택하시겠습니까?

1. **PWA 방식** - 빠르고 간단, 자동 업데이트
2. **Capacitor 방식** - 더 많은 네이티브 기능, 복잡한 설정

선택하시면 해당 방법으로 계속 진행하겠습니다.
