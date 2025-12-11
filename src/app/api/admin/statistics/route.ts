import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // Check authentication
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const gender = searchParams.get('gender') || 'all';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
      is_completed: true, // Only show completed tests
    };

    if (gender !== 'all') {
      whereClause.gender = gender;
    }

    if (startDate) {
      whereClause.created_at = {
        ...whereClause.created_at,
        gte: new Date(startDate),
      };
    }

    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      whereClause.created_at = {
        ...whereClause.created_at,
        lte: endDateTime,
      };
    }

    // Fetch data with pagination
    const [results, totalCount] = await Promise.all([
      prisma.testAttempts.findMany({
        where: whereClause,
        include: {
          test_results: {
            include: {
              primary_personality_type: {
                include: {
                  translations: {
                    where: { language_code: 'ko' },
                  },
                },
              },
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.testAttempts.count({ where: whereClause }),
    ]);

    // Transform data
    const statistics = results.map((attempt) => {
      const result = attempt.test_results[0];
      const personalityType = result?.primary_personality_type;
      const translation = personalityType?.translations[0];

      return {
        user_name: attempt.user_name || '',
        user_email: attempt.user_email || '',
        gender: attempt.gender || '',
        result_created_at_kst: attempt.created_at,
        personality_code: personalityType?.type_code || '',
        personality_name: translation?.type_name || '',
        personality_title: translation?.title || '',
        personality_theme: translation?.theme_sentence || '',
        personality_description: translation?.description || '',
      };
    });

    return NextResponse.json({
      success: true,
      data: statistics,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Statistics API error:', error);
    return NextResponse.json(
      { success: false, error: '통계 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
