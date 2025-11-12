# 안드로이드 APK/AAB 빌드 가이드

## 사전 준비사항

### 1. Android Studio 설치
- https://developer.android.com/studio 에서 다운로드
- 설치 후 SDK 설정 완료

### 2. Java JDK 설치
- JDK 17 이상 권장
- 환경 변수 JAVA_HOME 설정

## 빌드 단계

### 1. 프로젝트 빌드
```bash
npm run build
```

### 2. Capacitor 동기화
```bash
npx cap sync android
```

### 3. Android Studio 열기
```bash
npx cap open android
```

### 4. 앱 정보 수정

`android/app/src/main/AndroidManifest.xml` 파일에서:
- 앱 이름
- 권한 설정
- 인터넷 권한 확인

`android/app/build.gradle` 파일에서:
- applicationId: "com.personality.test"
- versionCode: 1
- versionName: "1.0.0"

### 5. 서명 키 생성

```bash
cd android/app
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

정보 입력:
- 비밀번호 (기억할 것!)
- 이름, 조직 등

### 6. 서명 설정

`android/app/build.gradle`에 추가:

```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file('my-release-key.keystore')
            storePassword 'your-password'
            keyAlias 'my-key-alias'
            keyPassword 'your-password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 7. 릴리스 빌드

Android Studio에서:
1. Build > Generate Signed Bundle / APK
2. Android App Bundle (AAB) 선택 (플레이 스토어용)
3. 또는 APK 선택 (직접 배포용)
4. 서명 키 정보 입력
5. release 빌드 타입 선택
6. Finish

또는 명령줄에서:
```bash
cd android
./gradlew assembleRelease  # APK
./gradlew bundleRelease    # AAB
```

생성 위치:
- APK: `android/app/build/outputs/apk/release/app-release.apk`
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`

## 구글 플레이 스토어 업로드

### 1. Google Play Console 계정 생성
- https://play.google.com/console
- 개발자 등록 ($25 일회성 비용)

### 2. 새 앱 만들기
- 앱 이름: "나를 찾아줘"
- 기본 언어: 한국어
- 앱 유형: 앱 또는 게임
- 무료/유료 선택

### 3. 앱 콘텐츠 작성
- 앱 설명 (짧은 설명, 전체 설명)
- 스크린샷 (최소 2개, 권장 8개)
  - 휴대전화: 16:9 또는 9:16 비율
  - 최소 320px, 최대 3840px
- 아이콘 (512x512 PNG)
- 기능 그래픽 (1024x500 PNG)

### 4. AAB 업로드
- 프로덕션 > 새 릴리스 만들기
- AAB 파일 업로드
- 출시 노트 작성

### 5. 콘텐츠 등급
- 설문지 작성
- 앱 카테고리에 맞는 등급 받기

### 6. 타겟 국가 및 지역
- 한국 선택 (또는 원하는 국가)

### 7. 가격 및 배포
- 무료/유료 설정
- 국가별 가격 설정 (유료인 경우)

### 8. 검토 제출
- 모든 필수 항목 완료
- 검토 제출
- 승인까지 보통 1-3일 소요

## 주의사항

⚠️ **중요**: 이 앱은 서버 API를 사용합니다!

현재 설정으로는 로컬 API를 호출하므로, 다음 중 하나를 선택해야 합니다:

### 옵션 A: 백엔드 배포 (권장)
1. Vercel, Railway 등에 백엔드 배포
2. 환경 변수로 API URL 설정
3. 앱에서 배포된 API 호출

### 옵션 B: PWA로 전환
1. 웹 앱으로 배포 (Vercel 등)
2. TWA (Trusted Web Activity)로 플레이 스토어 등록
3. 더 간단하고 자동 업데이트 가능

## 다음 단계

1. ✅ Capacitor 설정 완료
2. ⏳ 앱 아이콘 준비 (`node scripts/generate-icons.js` 실행)
3. ⏳ 백엔드 API 배포 또는 PWA 전환 결정
4. ⏳ 서명 키 생성
5. ⏳ 릴리스 빌드
6. ⏳ 플레이 스토어 등록

도움이 필요하면 언제든 물어보세요!
