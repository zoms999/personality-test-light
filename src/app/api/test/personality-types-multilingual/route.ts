/**
 * 다국어 성격 유형 조회 API (예시)
 * 
 * 사용법:
 * GET /api/test/personality-types-multilingual?lang=ko
 * GET /api/test/personality-types-multilingual?lang=en&type=OBSERVER
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllPersonalityTypes, getPersonalityType } from '@/lib/i18n/db-queries';
import type { LanguageCode } from '@/lib/i18n/db-queries';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const lang = searchParams.get('lang') || 'ko';
        const typeCode = searchParams.get('type');

        // 지원하는 언어 코드 검증
        const supportedLanguages: LanguageCode[] = ['ko', 'en', 'jp'];
        const languageCode = supportedLanguages.includes(lang as LanguageCode)
            ? (lang as LanguageCode)
            : 'ko';

        // 특정 유형 조회
        if (typeCode) {
            const personalityType = await getPersonalityType(typeCode, languageCode);

            if (!personalityType) {
                return NextResponse.json(
                    {
                        success: false,
                        message: `Personality type not found: ${typeCode}`,
                    },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                success: true,
                message: 'Personality type retrieved successfully',
                data: {
                    language: languageCode,
                    personality_type: {
                        id: personalityType.id,
                        type_code: personalityType.type_code,
                        type_name: personalityType.type_name,
                        title: personalityType.title,
                        theme_sentence: personalityType.theme_sentence,
                        description: personalityType.description,
                        description_points: personalityType.description_points,
                        strength_keywords: personalityType.strength_keywords,
                        weakness_keywords: personalityType.weakness_keywords,
                    },
                },
            });
        }

        // 모든 유형 조회
        const personalityTypes = await getAllPersonalityTypes(languageCode);

        if (!personalityTypes || personalityTypes.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: `No personality types found for language: ${languageCode}`,
                    data: [],
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Personality types retrieved successfully',
            data: {
                language: languageCode,
                total_types: personalityTypes.length,
                personality_types: personalityTypes.map((type) => ({
                    id: type.id,
                    type_code: type.type_code,
                    type_name: type.type_name,
                    title: type.title,
                    theme_sentence: type.theme_sentence,
                    description: type.description,
                    description_points: type.description_points,
                    strength_keywords: type.strength_keywords,
                    weakness_keywords: type.weakness_keywords,
                })),
            },
        });
    } catch (error) {
        console.error('Error fetching personality types:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch personality types',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
