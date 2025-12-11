/**
 * 다국어 데이터베이스 조회 헬퍼 함수
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type LanguageCode = 'ko' | 'en' | 'jp';

/**
 * 활성화된 질문 목록 조회 (다국어)
 */
export async function getActiveQuestions(languageCode: LanguageCode = 'ko') {
    const questions = await prisma.questions.findMany({
        where: {
            is_active: true,
        },
        include: {
            translations: {
                where: {
                    language_code: languageCode,
                },
            },
            personality_type: {
                include: {
                    translations: {
                        where: {
                            language_code: languageCode,
                        },
                    },
                },
            },
        },
        orderBy: {
            question_order_in_type: 'asc',
        },
    });

    return questions.map((q) => ({
        id: q.id,
        personality_type_id: q.personality_type_id,
        question_order_in_type: q.question_order_in_type,
        is_active: q.is_active,
        question_text: q.translations[0]?.question_text || '',
        personality_type: {
            type_code: q.personality_type.type_code,
            type_name: q.personality_type.translations[0]?.type_name || '',
        },
        created_at: q.created_at,
        updated_at: q.updated_at,
    }));
}

/**
 * 특정 성격 유형 정보 조회 (다국어)
 */
export async function getPersonalityType(
    typeCode: string,
    languageCode: LanguageCode = 'ko'
) {
    const personalityType = await prisma.personalityTypes.findUnique({
        where: {
            type_code: typeCode,
        },
        include: {
            translations: {
                where: {
                    language_code: languageCode,
                },
            },
        },
    });

    if (!personalityType || personalityType.translations.length === 0) {
        return null;
    }

    const translation = personalityType.translations[0];

    return {
        id: personalityType.id,
        type_code: personalityType.type_code,
        type_name: translation.type_name,
        title: translation.title,
        theme_sentence: translation.theme_sentence,
        description: translation.description,
        description_points: translation.description_points,
        strength_keywords: translation.strength_keywords,
        weakness_keywords: translation.weakness_keywords,
        created_at: personalityType.created_at,
        updated_at: personalityType.updated_at,
    };
}

/**
 * 모든 성격 유형 조회 (다국어)
 */
export async function getAllPersonalityTypes(languageCode: LanguageCode = 'ko') {
    const types = await prisma.personalityTypes.findMany({
        include: {
            translations: {
                where: {
                    language_code: languageCode,
                },
            },
        },
        orderBy: {
            type_code: 'asc',
        },
    });

    return types
        .filter((type) => type.translations.length > 0)
        .map((type) => {
            const translation = type.translations[0];
            return {
                id: type.id,
                type_code: type.type_code,
                type_name: translation.type_name,
                title: translation.title,
                theme_sentence: translation.theme_sentence,
                description: translation.description,
                description_points: translation.description_points,
                strength_keywords: translation.strength_keywords,
                weakness_keywords: translation.weakness_keywords,
                created_at: type.created_at,
                updated_at: type.updated_at,
            };
        });
}

/**
 * 특정 질문 조회 (다국어)
 */
export async function getQuestion(
    questionId: number,
    languageCode: LanguageCode = 'ko'
) {
    const question = await prisma.questions.findUnique({
        where: {
            id: questionId,
        },
        include: {
            translations: {
                where: {
                    language_code: languageCode,
                },
            },
        },
    });

    if (!question || question.translations.length === 0) {
        return null;
    }

    return {
        id: question.id,
        personality_type_id: question.personality_type_id,
        question_order_in_type: question.question_order_in_type,
        is_active: question.is_active,
        question_text: question.translations[0].question_text,
        created_at: question.created_at,
        updated_at: question.updated_at,
    };
}

/**
 * 테스트 시도 생성 (언어 정보 포함)
 */
export async function createTestAttempt(
    data: {
        userName?: string;
        birthDate?: string;
        gender?: string;
        userEmail?: string;
        phoneNumber?: string;
        agreedToPrivacy?: boolean;
        ipAddress?: string;
        userAgent?: string;
        languageCode?: LanguageCode;
    }
) {
    return await prisma.testAttempts.create({
        data: {
            user_name: data.userName,
            birth_date: data.birthDate,
            gender: data.gender,
            user_email: data.userEmail,
            phone_number: data.phoneNumber,
            agreed_to_privacy: data.agreedToPrivacy || false,
            ip_address: data.ipAddress,
            user_agent: data.userAgent,
            language_code: data.languageCode || 'ko',
        },
    });
}

/**
 * 테스트 결과 조회 (다국어)
 */
export async function getTestResult(
    attemptId: string,
    languageCode: LanguageCode = 'ko'
) {
    const result = await prisma.testResults.findUnique({
        where: {
            test_attempt_id: attemptId,
        },
        include: {
            primary_personality_type: {
                include: {
                    translations: {
                        where: {
                            language_code: languageCode,
                        },
                    },
                },
            },
        },
    });

    if (!result) {
        return null;
    }

    return {
        id: result.id,
        test_attempt_id: result.test_attempt_id,
        primary_personality_type: result.primary_personality_type
            ? {
                id: result.primary_personality_type.id,
                type_code: result.primary_personality_type.type_code,
                type_name: result.primary_personality_type.translations[0]?.type_name || '',
                title: result.primary_personality_type.translations[0]?.title || '',
                theme_sentence: result.primary_personality_type.translations[0]?.theme_sentence || '',
                description: result.primary_personality_type.translations[0]?.description || '',
                description_points: result.primary_personality_type.translations[0]?.description_points,
                strength_keywords: result.primary_personality_type.translations[0]?.strength_keywords,
                weakness_keywords: result.primary_personality_type.translations[0]?.weakness_keywords,
            }
            : null,
        total_scores: result.total_scores,
        percentage_scores: result.percentage_scores,
        detailed_analysis: result.detailed_analysis,
        recommendations: result.recommendations,
        share_token: result.share_token,
        is_shared: result.is_shared,
        created_at: result.created_at,
        updated_at: result.updated_at,
    };
}

export { prisma };
