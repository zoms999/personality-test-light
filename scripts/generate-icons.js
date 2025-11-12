// 앱 아이콘 생성 스크립트
// 실행: node scripts/generate-icons.js

const fs = require('fs');
const path = require('path');

console.log('📱 앱 아이콘 생성 가이드');
console.log('='.repeat(50));
console.log('');
console.log('다음 단계를 따라 앱 아이콘을 준비하세요:');
console.log('');
console.log('1. 1024x1024 크기의 앱 아이콘 이미지를 준비하세요');
console.log('   - PNG 형식 권장');
console.log('   - 투명 배경 가능');
console.log('   - 앱을 대표하는 심플한 디자인');
console.log('');
console.log('2. 온라인 아이콘 생성기 사용:');
console.log('   🔗 https://icon.kitchen/');
console.log('   🔗 https://www.pwabuilder.com/imageGenerator');
console.log('');
console.log('3. 생성된 아이콘들을 다음 위치에 저장:');
console.log('   - public/icon-192.png (192x192)');
console.log('   - public/icon-512.png (512x512)');
console.log('   - android/app/src/main/res/ (안드로이드용)');
console.log('');
console.log('4. 또는 기존 로고 사용:');
console.log('   - public/oct_logo.jpg를 변환하여 사용 가능');
console.log('');
console.log('='.repeat(50));

// 임시 아이콘 생성 (실제 프로덕션에서는 제대로 된 아이콘 사용 필요)
const publicDir = path.join(__dirname, '..', 'public');

// SVG 플레이스홀더 생성
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#3b82f6"/>
  <text x="256" y="280" font-family="Arial, sans-serif" font-size="200" font-weight="bold" text-anchor="middle" fill="white">나</text>
</svg>`;

console.log('');
console.log('⚠️  임시 플레이스홀더 아이콘을 생성합니다...');
console.log('   실제 배포 전에 반드시 전문적인 아이콘으로 교체하세요!');
console.log('');

// 참고: 실제 PNG 생성은 sharp 같은 라이브러리 필요
// 여기서는 가이드만 제공
