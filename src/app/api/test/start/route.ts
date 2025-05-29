import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { startTestSchema } from '@/lib/zod-schemas';
import type { StartTestResponse, ErrorResponse } from '@/lib/types';

/**
 * 새로운 검사 시도 시작 (개인정보 포함)
 * POST /api/test/start
 */
export async function POST(request: NextRequest): Promise<NextResponse<StartTestResponse | ErrorResponse>> {
  try {
    // 요청 본문 파싱
    const body = await request.json();
    
    // 입력 데이터 유효성 검사
    const validation = startTestSchema.safeParse(body);
    if (!validation.success) {
      console.log('Validation errors:', validation.error.flatten());
      return NextResponse.json(
        {
          success: false,
          error: '입력 데이터가 유효하지 않습니다.',
          details: validation.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const { 
      userName, 
      birthDate, // YYYYMMDD string
      age,       // Calculated age number
      gender, 
      userEmail, 
      phoneNumber, 
      agreedToPrivacy 
    } = validation.data;

    // 클라이언트 정보 수집
    const ip_address = request.headers.get('x-forwarded-for') || 
      request.headers.get('x-real-ip') || 
      'unknown';
    const user_agent = request.headers.get('user-agent') || 'unknown';

    // 로깅용 디스플레이 이름
    const displayNameForLogging = `${userName} (${gender}, ${age}세)`;

    // 새로운 테스트 시도 생성
    const testAttempt = await prisma.testAttempts.create({
      data: {
        // 개인정보 필드들
        user_name: userName, // 실제 이름 저장
        birth_date: birthDate, // YYYYMMDD 형식 생년월일
        gender: gender, // 성별 추가
        user_email: userEmail,
        phone_number: phoneNumber,
        agreed_to_privacy: agreedToPrivacy,
        // 시스템 정보
        ip_address,
        user_agent,
        is_completed: false, // 테스트 시작 단계
        // created_at, updated_at은 Prisma가 자동 처리
      }
    });

    console.log(`[TEST_START] 새로운 테스트 시도 생성 (사용자: ${displayNameForLogging}): ${testAttempt.id}`);

    return NextResponse.json(
      {
        success: true,
        attempt_id: testAttempt.id,
        message: '테스트가 성공적으로 시작되었습니다.'
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('[API_TEST_START_ERROR]', error);
    
    if (error instanceof z.ZodError) { // Should be caught by safeParse typically
      return NextResponse.json(
        {
          success: false,
          error: '데이터 검증 오류가 발생했습니다.',
          details: error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    // Handle Prisma or other DB errors specifically if possible
    // Example: Unique constraint violation (e.g., if email must be unique and it's not)
    if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
        // Check for specific Prisma error codes if necessary
        return NextResponse.json(
            {
              success: false,
              error: '데이터베이스 처리 중 오류가 발생했습니다.',
              details: process.env.NODE_ENV === 'development' ? { code: error.code, message: (error as unknown as {message: string}).message } : undefined
            },
            { status: 500 }
          );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      },
      { status: 500 }
    );
  }
} 