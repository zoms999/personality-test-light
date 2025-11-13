// 임시 플레이스홀더 아이콘 생성 스크립트
// 실행: node create-placeholder-icons.js

const fs = require('fs');
const path = require('path');

console.log('\n🎨 임시 플레이스홀더 아이콘 생성\n');
console.log('⚠️  이 스크립트는 Canvas API가 필요합니다.');
console.log('   브라우저 기반 생성기를 사용하는 것을 권장합니다.\n');

console.log('━'.repeat(60));
console.log('📌 아이콘 생성 방법 (3가지)');
console.log('━'.repeat(60));
console.log('\n');

console.log('✅ 방법 1: 브라우저 생성기 (가장 쉬움)');
console.log('   1. npm run dev');
console.log('   2. http://localhost:3000/generate-icons.html');
console.log('   3. "모든 아이콘 다운로드" 클릭\n');

console.log('✅ 방법 2: Icon Kitchen (전문적)');
console.log('   1. https://icon.kitchen/');
console.log('   2. 텍스트 "나" 입력');
console.log('   3. 배경색: #3b82f6');
console.log('   4. 다운로드\n');

console.log('✅ 방법 3: 기존 로고 변환');
console.log('   1. https://www.iloveimg.com/resize-image');
console.log('   2. public/oct_logo.jpg 업로드');
console.log('   3. 192x192, 512x512로 리사이즈\n');

console.log('━'.repeat(60));
console.log('📋 필요한 파일');
console.log('━'.repeat(60));
console.log('\n');

const publicDir = path.join(__dirname, 'public');
const icon192 = path.join(publicDir, 'icon-192.png');
const icon512 = path.join(publicDir, 'icon-512.png');

const has192 = fs.existsSync(icon192);
const has512 = fs.existsSync(icon512);

console.log('  public/');
console.log(`  ├── icon-192.png  ${has192 ? '✅' : '❌ 필요'}`);
console.log(`  └── icon-512.png  ${has512 ? '✅' : '❌ 필요'}`);
console.log('\n');

if (has192 && has512) {
  console.log('🎉 모든 아이콘이 준비되었습니다!');
  console.log('\n다음 단계:');
  console.log('  npm run build');
  console.log('  vercel\n');
} else {
  console.log('⚠️  아이콘을 생성해주세요!');
  console.log('\n가장 빠른 방법:');
  console.log('  npm run dev');
  console.log('  브라우저에서 http://localhost:3000/generate-icons.html 열기\n');
}

console.log('━'.repeat(60));
console.log('\n');
