import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // test_attempts 테이블에서 총 참여자 수 조회
    const count = await prisma.testAttempts.count();

    // 실제 참여자 수 + 336,583
    const totalParticipants = count + 336583;

    return NextResponse.json({
      success: true,
      data: {
        actual_count: count,
        display_count: totalParticipants,
        base_offset: 336583
      }
    });

  } catch (error) {
    console.error('참여자 수 API 오류:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 