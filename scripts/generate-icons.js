// 앱 아이콘 생성 가이드 스크립트
// 실행: node scripts/generate-icons.js

const fs = require('fs');
const path = require('path');

console.log('\n');
console.log('🎨 '.repeat(25));
console.log('📱 PWA 아이콘 생성 가이드');
console.log('🎨 '.repeat(25));
console.log('\n');

// 아이콘 파일 확인
const publicDir = path.join(__dirname, '..', 'public');
const icon192 = path.join(publicDir, 'icon-192.png');
const icon512 = path.join(publicDir, 'icon-512.png');

const has192 = fs.existsSync(icon192);
const has512 = fs.existsSync(icon512);

if (has192 && has512) {
  console.log('✅ 아이콘이 이미 존재합니다!');
  console.log('   - icon-192.png ✓');
  console.log('   - icon-512.png ✓');
  console.log('\n');
  console.log('🎉 PWA 배포 준비가 완료되었습니다!');
  console.log('\n');
  console.log('다음 단계:');
  console.log('1. npm run build - 빌드 테스트');
  console.log('2. vercel - 배포');
  console.log('3. PWABuilder로 TWA 생성');
  console.log('\n');
} else {
  console.log('⚠️  PNG 아이콘이 필요합니다!');
  console.log('\n');
  console.log('━'.repeat(50));
  console.log('🚀 빠른 방법 (3가지 옵션)');
  console.log('━'.repeat(50));
  console.log('\n');
  
  console.log('📌 옵션 1: 브라우저에서 생성 (가장 빠름)');
  console.log('   1. npm run dev');
  console.log('   2. http://localhost:3000/generate-icons.html 접속');
  console.log('   3. "모든 아이콘 다운로드" 클릭');
  console.log('   4. public 폴더에 복사');
  console.log('\n');
  
  console.log('📌 옵션 2: Icon Kitchen 사용 (전문적)');
  console.log('   1. https://icon.kitchen/ 접속');
  console.log('   2. 이미지 업로드 또는 텍스트 입력');
  console.log('   3. 다운로드');
  console.log('   4. public 폴더에 복사');
  console.log('\n');
  
  console.log('📌 옵션 3: 기존 로고 변환');
  console.log('   1. https://www.iloveimg.com/resize-image 접속');
  console.log('   2. public/oct_logo.jpg 업로드');
  console.log('   3. 192x192, 512x512로 리사이즈');
  console.log('   4. public 폴더에 저장');
  console.log('\n');
  
  console.log('━'.repeat(50));
  console.log('📋 필요한 파일');
  console.log('━'.repeat(50));
  console.log('\n');
  console.log('  public/');
  console.log('  ├── icon-192.png  ← 192x192 PNG ' + (has192 ? '✓' : '✗'));
  console.log('  └── icon-512.png  ← 512x512 PNG ' + (has512 ? '✓' : '✗'));
  console.log('\n');
  
  console.log('💡 자세한 가이드: ICON-GENERATION-GUIDE.md 파일 참조');
  console.log('\n');
}

console.log('🎨 '.repeat(25));
console.log('\n');
