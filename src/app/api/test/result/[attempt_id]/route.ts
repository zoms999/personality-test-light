import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  attempt_id: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const { attempt_id } = await params;

    // attempt_id가 UUID 형식인지 유효성 검사
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(attempt_id)) {
      return NextResponse.json({
        success: false,
        error: '유효한 테스트 시도 ID를 입력해주세요.',
      }, { status: 400 });
    }

    // 1. TestAttempt가 존재하고 완료되었는지 확인
    const testAttempt = await prisma.testAttempts.findUnique({
      where: { id: attempt_id },
    });

    if (!testAttempt) {
      return NextResponse.json({
        success: false,
        error: '해당 테스트 시도를 찾을 수 없습니다.',
      }, { status: 404 });
    }

    if (!testAttempt.is_completed) {
      return NextResponse.json({
        success: false,
        error: '아직 완료되지 않은 테스트입니다.',
      }, { status: 400 });
    }

    // 2. TestResults에서 해당 attempt_id의 결과 조회 (단일 레코드)
    const testResult = await prisma.testResults.findUnique({
      where: { test_attempt_id: attempt_id },
      include: {
        primary_personality_type: true,
      },
    });

    if (!testResult) {
      return NextResponse.json({
        success: false,
        error: '해당 테스트의 결과를 찾을 수 없습니다.',
      }, { status: 404 });
    }

    // 3. total_scores JSON에서 모든 유형별 점수 추출
    const allTypeScores = testResult.total_scores as Record<string, number>;
    
    // 4. 모든 성격 유형 정보 조회 (모든 번역 포함)
    const allPersonalityTypes = await prisma.personalityTypes.findMany({
      include: {
        translations: true
      }
    });
    const personalityTypesMap = new Map(allPersonalityTypes.map(type => [type.id, type]));

    // 5. 점수와 성격 유형 정보 매핑
    const scoresWithTypes = Object.entries(allTypeScores).map(([typeId, score]) => {
      const personalityType = personalityTypesMap.get(typeId);
      if (!personalityType) {
        throw new Error(`성향 유형을 찾을 수 없습니다: ${typeId}`);
      }
      
      return {
        type_id: typeId,
        score: score,
        personality_type: personalityType,
      };
    });

    // 6. 최고 점수 찾기
    const maxScore = Math.max(...scoresWithTypes.map(item => item.score));

    // 7. 최고 점수와 동일한 점수를 가진 모든 유형들 찾기 (동점 처리)
    const winningTypes = scoresWithTypes.filter(item => item.score === maxScore);

    // Lang 파라미터 추출
    const searchParams = request.nextUrl.searchParams;
    const lang = searchParams.get('lang') || 'ko';

    // 번역 헬퍼 함수
    const getTranslatedType = (personalityType: any) => {
      const translations = personalityType.translations;
      const t = translations.find((t: any) => t.language_code === lang) 
             || translations.find((t: any) => t.language_code === 'ko') 
             || translations[0];
      
      // 이미지 매핑을 위한 한국어 타이틀 (항상 'ko' 검색)
      const koTitle = translations.find((t: any) => t.language_code === 'ko')?.title || t?.title || '';

      return {
        id: personalityType.id,
        type_code: personalityType.type_code,
        type_name: t?.type_name || '',
        title: t?.title || '',
        original_title: koTitle, // 에셋 매핑용
        theme_sentence: t?.theme_sentence || '',
        description: t?.description || '',
        description_points: typeof t?.description_points === 'object' ? t?.description_points as string[] : [],
        strength_keywords: typeof t?.strength_keywords === 'object' ? t?.strength_keywords as string[] : [],
        weakness_keywords: typeof t?.weakness_keywords === 'object' ? t?.weakness_keywords as string[] : [],
      };
    };

    // 8. 각 우승 유형의 상세 정보 구성
    const resultPersonalityTypes = winningTypes.map(winning => ({
      ...getTranslatedType(winning.personality_type),
      calculated_score: winning.score
    }));

    // 9. 전체 유형 목록 구성 (프론트엔드 "다른 유형 보기" 용)
    const allTypesList = allPersonalityTypes.map(type => getTranslatedType(type));

    // 10. 최종 결과 반환
    return NextResponse.json({
      success: true,
      data: {
        attempt_id: attempt_id,
        test_completed_at: testAttempt.updated_at,
        max_score: maxScore,
        personality_types: resultPersonalityTypes,
        all_types: allTypesList, // 전체 유형 목록 추가
        is_tie: winningTypes.length > 1, 
        total_questions_answered: 45, 
      },
      message: winningTypes.length > 1 
        ? `${winningTypes.length}개의 성향 유형이 동점으로 나타났습니다.`
        : '성향 검사 결과가 성공적으로 조회되었습니다.',
    }, { status: 200 });

  } catch (error) {
    console.error('결과 조회 처리 중 오류 발생:', error);

    return NextResponse.json({
      success: false,
      error: '결과 조회 처리 중 오류가 발생했습니다.',
    }, { status: 500 });
  }
} 