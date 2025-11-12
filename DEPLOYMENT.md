# 🚀 구글 플레이 스토어 배포 가이드

## 📋 현재 상태

✅ **완료된 작업:**
- Capacitor 설치 및 설정
- Android 플랫폼 추가
- PWA manifest.json 생성
- 빌드 스크립트 구성

⏳ **필요한 작업:**
- 앱 아이콘 준비
- 백엔드 API 배포 (또는 PWA 방식 선택)
- 서명 키 생성
- 플레이 스토어 계정 생성

## 🎯 배포 방법 선택

### 방법 1: PWA + TWA (추천) ⭐

**장점:**
- 설정이 간단함
- 자동 업데이트
- 서버 API 그대로 사용 가능
- 웹과 앱 동시 운영

**단계:**
1. 웹 앱을 Vercel/Netlify에 배포
2. PWABuilder로 TWA 생성
3. 플레이 스토어에 업로드

**시작하기:**
```bash
# 1. 웹 배포 (Vercel 예시)
npm install -g vercel
vercel

# 2. PWABuilder 사용
# https://www.pwabuilder.com/ 접속
# 배포된 URL 입력
# Android 패키지 다운로드
```

### 방법 2: Capacitor (현재 설정)

**장점:**
- 더 많은 네이티브 기능 접근
- 오프라인 지원 가능
- 완전한 네이티브 앱 경험

**단계:**
1. 백엔드 API 별도 배포
2. 앱 빌드 및 동기화
3. Android Studio에서 APK/AAB 생성
4. 플레이 스토어에 업로드

**시작하기:**
```bash
# 1. 아이콘 가이드 확인
npm run icons:guide

# 2. 앱 빌드 및 동기화
npm run cap:sync

# 3. Android Studio 열기
npm run cap:open

# 4. Android Studio에서 빌드
# Build > Generate Signed Bundle / APK
```

## 📱 빠른 시작 (Capacitor 방식)

### 1단계: 환경 설정

```bash
# Android Studio 설치 확인
# https://developer.android.com/studio

# JDK 설치 확인
java -version  # 17 이상 필요
```

### 2단계: 앱 아이콘 준비

```bash
# 아이콘 가이드 실행
npm run icons:guide

# 아이콘 생성 사이트:
# - https://icon.kitchen/
# - https://www.pwabuilder.com/imageGenerator

# 필요한 아이콘:
# - public/icon-192.png (192x192)
# - public/icon-512.png (512x512)
```

### 3단계: 백엔드 배포

이 앱은 API 라우트와 데이터베이스를 사용합니다.

**옵션 A: Vercel 배포 (권장)**
```bash
npm install -g vercel
vercel

# 환경 변수 설정:
# - DATABASE_URL
# - NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY
```

**옵션 B: Railway 배포**
```bash
# https://railway.app/ 에서 프로젝트 생성
# GitHub 연동 후 자동 배포
```

### 4단계: 앱 빌드

```bash
# 1. 빌드 및 동기화
npm run cap:sync

# 2. Android Studio 열기
npm run cap:open

# 3. 앱 정보 수정
# android/app/build.gradle:
# - applicationId
# - versionCode
# - versionName
```

### 5단계: 서명 키 생성

```bash
cd android/app
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

# 비밀번호와 정보 입력
# ⚠️ 키 파일과 비밀번호를 안전하게 보관!
```

### 6단계: 릴리스 빌드

**Android Studio에서:**
1. Build > Generate Signed Bundle / APK
2. Android App Bundle (AAB) 선택
3. 서명 키 정보 입력
4. release 빌드 선택
5. Finish

**또는 명령줄에서:**
```bash
# APK 생성 (직접 배포용)
npm run android:build

# AAB 생성 (플레이 스토어용)
npm run android:bundle
```

### 7단계: 플레이 스토어 업로드

1. **Google Play Console 접속**
   - https://play.google.com/console
   - 개발자 등록 ($25)

2. **새 앱 만들기**
   - 앱 이름: "나를 찾아줘"
   - 언어: 한국어
   - 앱/게임 선택

3. **앱 콘텐츠 작성**
   - 짧은 설명 (80자)
   - 전체 설명 (4000자)
   - 스크린샷 (최소 2개)
   - 아이콘 (512x512)
   - 기능 그래픽 (1024x500)

4. **AAB 업로드**
   - 프로덕션 > 새 릴리스
   - AAB 파일 업로드
   - 출시 노트 작성

5. **검토 제출**
   - 모든 필수 항목 완료
   - 검토 제출 (1-3일 소요)

## 🔧 문제 해결

### 빌드 오류

```bash
# Gradle 캐시 정리
cd android
./gradlew clean

# 의존성 재설치
npm install
npm run cap:sync
```

### API 연결 오류

앱에서 API를 호출할 수 없는 경우:

1. **네트워크 권한 확인**
   `android/app/src/main/AndroidManifest.xml`:
   ```xml
   <uses-permission android:name="android.permission.INTERNET" />
   ```

2. **API URL 설정**
   환경 변수 또는 설정 파일에서 배포된 API URL 사용

3. **CORS 설정**
   백엔드에서 앱 도메인 허용

## 📚 추가 자료

- [Capacitor 공식 문서](https://capacitorjs.com/docs)
- [Android 개발자 가이드](https://developer.android.com/guide)
- [Google Play Console 도움말](https://support.google.com/googleplay/android-developer)
- [PWABuilder](https://www.pwabuilder.com/)

## 💡 팁

1. **테스트 빌드 먼저**
   - 내부 테스트 트랙으로 먼저 배포
   - 소수 사용자에게 테스트 후 프로덕션 배포

2. **버전 관리**
   - versionCode는 매 릴리스마다 증가
   - versionName은 사용자에게 표시되는 버전

3. **스크린샷 준비**
   - 다양한 화면 크기 준비
   - 앱의 주요 기능 강조

4. **설명 작성**
   - 키워드 포함 (SEO)
   - 명확하고 간결하게
   - 주요 기능 나열

## 🆘 도움이 필요하신가요?

- 상세 가이드: `android-build-guide.md` 참조
- 배포 방법 비교: `android-deployment-guide.md` 참조
- 아이콘 생성: `npm run icons:guide` 실행

질문이 있으시면 언제든 물어보세요! 🚀
