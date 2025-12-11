/**
 * 다국어 질문 조회 API (예시)
 * 
 * 사용법:
 * GET /api/test/questions-multilingual?lang=ko
 * GET /api/test/questions-multilingual?lang=en
 */

import { NextRequest, NextResponse } from 'next/server';
import { getActiveQuestions } from '@/lib/i18n/db-queries';
import type { LanguageCode } from '@/lib/i18n/db-queries';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const lang = searchParams.get('lang') || 'ko';

        // 지원하는 언어 코드 검증
        const supportedLanguages: LanguageCode[] = ['ko', 'en', 'jp'];
        const languageCode = supportedLanguages.includes(lang as LanguageCode)
            ? (lang as LanguageCode)
            : 'ko';

        // 다국어 질문 조회
        const questions = await getActiveQuestions(languageCode);

        if (!questions || questions.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: `No questions found for language: ${languageCode}`,
                    data: [],
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Questions retrieved successfully',
            data: {
                language: languageCode,
                total_questions: questions.length,
                questions: questions.map((q) => ({
                    id: q.id,
                    question_text: q.question_text,
                    question_order: q.question_order_in_type,
                    personality_type: {
                        id: q.personality_type_id,
                        code: q.personality_type.type_code,
                        name: q.personality_type.type_name,
                    },
                })),
            },
        });
    } catch (error) {
        console.error('Error fetching questions:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch questions',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
