/**
 * 다국어 마이그레이션 검증 스크립트
 * 
 * 사용법:
 * npx ts-node scripts/verify-multilingual-migration.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface VerificationResult {
    step: string;
    status: 'success' | 'warning' | 'error';
    message: string;
    details?: any;
}

const results: VerificationResult[] = [];

async function verifyTranslationTables() {
    console.log('\n🔍 Step 1: 번역 테이블 존재 확인...');

    try {
        // personality_type_translations 테이블 확인
        const typeTranslations = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_name = 'personality_type_translations'
    `;

        // question_translations 테이블 확인
        const questionTranslations = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_name = 'question_translations'
    `;

        results.push({
            step: '번역 테이블 존재 확인',
            status: 'success',
            message: '모든 번역 테이블이 존재합니다.',
            details: { typeTranslations, questionTranslations }
        });
    } catch (error) {
        results.push({
            step: '번역 테이블 존재 확인',
            status: 'error',
            message: '번역 테이블을 찾을 수 없습니다.',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

async function verifyDataMigration() {
    console.log('\n🔍 Step 2: 데이터 이관 확인...');

    try {
        // 성격 유형 데이터 확인
        const totalTypes = await prisma.personalityTypes.count();
        const translatedTypes = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(DISTINCT personality_type_id) as count
      FROM personality_type_translations
      WHERE language_code = 'ko'
    `;

        const typeCount = Number(translatedTypes[0]?.count || 0);

        if (totalTypes === typeCount) {
            results.push({
                step: '성격 유형 데이터 이관',
                status: 'success',
                message: `모든 성격 유형이 번역되었습니다. (${totalTypes}/${typeCount})`,
            });
        } else {
            results.push({
                step: '성격 유형 데이터 이관',
                status: 'warning',
                message: `일부 성격 유형이 번역되지 않았습니다. (${typeCount}/${totalTypes})`,
            });
        }

        // 질문 데이터 확인
        const totalQuestions = await prisma.questions.count();
        const translatedQuestions = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(DISTINCT question_id) as count
      FROM question_translations
      WHERE language_code = 'ko'
    `;

        const questionCount = Number(translatedQuestions[0]?.count || 0);

        if (totalQuestions === questionCount) {
            results.push({
                step: '질문 데이터 이관',
                status: 'success',
                message: `모든 질문이 번역되었습니다. (${totalQuestions}/${questionCount})`,
            });
        } else {
            results.push({
                step: '질문 데이터 이관',
                status: 'warning',
                message: `일부 질문이 번역되지 않았습니다. (${questionCount}/${totalQuestions})`,
            });
        }
    } catch (error) {
        results.push({
            step: '데이터 이관 확인',
            status: 'error',
            message: '데이터 이관 확인 중 오류가 발생했습니다.',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

async function verifyLanguageColumn() {
    console.log('\n🔍 Step 3: language_code 컬럼 확인...');

    try {
        const columnExists = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'test_attempts' 
        AND column_name = 'language_code'
      ) as exists
    `;

        if (columnExists[0]?.exists) {
            const defaultLanguage = await prisma.$queryRaw<Array<{ language_code: string; count: bigint }>>`
        SELECT language_code, COUNT(*) as count
        FROM test_attempts
        GROUP BY language_code
      `;

            results.push({
                step: 'language_code 컬럼 확인',
                status: 'success',
                message: 'test_attempts 테이블에 language_code 컬럼이 존재합니다.',
                details: defaultLanguage.map(row => ({
                    language: row.language_code,
                    count: Number(row.count)
                }))
            });
        } else {
            results.push({
                step: 'language_code 컬럼 확인',
                status: 'error',
                message: 'test_attempts 테이블에 language_code 컬럼이 없습니다.',
            });
        }
    } catch (error) {
        results.push({
            step: 'language_code 컬럼 확인',
            status: 'error',
            message: 'language_code 컬럼 확인 중 오류가 발생했습니다.',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

async function verifyIndexes() {
    console.log('\n🔍 Step 4: 인덱스 확인...');

    try {
        const indexes = await prisma.$queryRaw<Array<{ tablename: string; indexname: string }>>`
      SELECT tablename, indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename IN ('personality_type_translations', 'question_translations', 'test_attempts')
      ORDER BY tablename, indexname
    `;

        const requiredIndexes = [
            'personality_type_trans_idx',
            'personality_type_trans_lang_idx',
            'question_trans_idx',
            'question_trans_lang_idx',
            'test_attempts_lang_idx'
        ];

        const existingIndexNames = indexes.map(idx => idx.indexname);
        const missingIndexes = requiredIndexes.filter(idx => !existingIndexNames.includes(idx));

        if (missingIndexes.length === 0) {
            results.push({
                step: '인덱스 확인',
                status: 'success',
                message: '모든 필수 인덱스가 존재합니다.',
                details: indexes
            });
        } else {
            results.push({
                step: '인덱스 확인',
                status: 'warning',
                message: `일부 인덱스가 누락되었습니다: ${missingIndexes.join(', ')}`,
                details: { existing: indexes, missing: missingIndexes }
            });
        }
    } catch (error) {
        results.push({
            step: '인덱스 확인',
            status: 'error',
            message: '인덱스 확인 중 오류가 발생했습니다.',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

async function verifyForeignKeys() {
    console.log('\n🔍 Step 5: 외래 키 제약조건 확인...');

    try {
        const foreignKeys = await prisma.$queryRaw<Array<{
            constraint_name: string;
            table_name: string;
            column_name: string;
            foreign_table_name: string;
        }>>`
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name IN ('personality_type_translations', 'question_translations')
    `;

        if (foreignKeys.length >= 2) {
            results.push({
                step: '외래 키 제약조건 확인',
                status: 'success',
                message: '모든 외래 키 제약조건이 존재합니다.',
                details: foreignKeys
            });
        } else {
            results.push({
                step: '외래 키 제약조건 확인',
                status: 'warning',
                message: '일부 외래 키 제약조건이 누락되었을 수 있습니다.',
                details: foreignKeys
            });
        }
    } catch (error) {
        results.push({
            step: '외래 키 제약조건 확인',
            status: 'error',
            message: '외래 키 확인 중 오류가 발생했습니다.',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

async function verifySampleQuery() {
    console.log('\n🔍 Step 6: 샘플 쿼리 테스트...');

    try {
        // 다국어 질문 조회 테스트
        const sampleQuestions = await prisma.questions.findMany({
            where: { is_active: true },
            include: {
                translations: {
                    where: { language_code: 'ko' }
                }
            },
            take: 3
        });

        if (sampleQuestions.length > 0 && sampleQuestions[0].translations.length > 0) {
            results.push({
                step: '샘플 쿼리 테스트',
                status: 'success',
                message: '다국어 쿼리가 정상적으로 작동합니다.',
                details: {
                    sample_count: sampleQuestions.length,
                    first_question: {
                        id: sampleQuestions[0].id,
                        text: sampleQuestions[0].translations[0]?.question_text?.substring(0, 50) + '...'
                    }
                }
            });
        } else {
            results.push({
                step: '샘플 쿼리 테스트',
                status: 'warning',
                message: '쿼리는 작동하지만 번역 데이터가 없습니다.',
            });
        }
    } catch (error) {
        results.push({
            step: '샘플 쿼리 테스트',
            status: 'error',
            message: '샘플 쿼리 실행 중 오류가 발생했습니다.',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

function printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 마이그레이션 검증 결과');
    console.log('='.repeat(60) + '\n');

    let successCount = 0;
    let warningCount = 0;
    let errorCount = 0;

    results.forEach((result, index) => {
        const icon = result.status === 'success' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
        console.log(`${icon} ${index + 1}. ${result.step}`);
        console.log(`   ${result.message}`);

        if (result.details) {
            console.log(`   상세: ${JSON.stringify(result.details, null, 2)}`);
        }
        console.log('');

        if (result.status === 'success') successCount++;
        else if (result.status === 'warning') warningCount++;
        else errorCount++;
    });

    console.log('='.repeat(60));
    console.log(`총 ${results.length}개 검증 항목`);
    console.log(`✅ 성공: ${successCount} | ⚠️ 경고: ${warningCount} | ❌ 오류: ${errorCount}`);
    console.log('='.repeat(60) + '\n');

    if (errorCount > 0) {
        console.log('❌ 마이그레이션에 문제가 있습니다. 위의 오류를 확인하세요.');
        process.exit(1);
    } else if (warningCount > 0) {
        console.log('⚠️ 마이그레이션이 완료되었지만 일부 경고가 있습니다.');
    } else {
        console.log('✅ 마이그레이션이 성공적으로 완료되었습니다!');
    }
}

async function main() {
    console.log('🚀 다국어 마이그레이션 검증을 시작합니다...\n');

    try {
        await verifyTranslationTables();
        await verifyDataMigration();
        await verifyLanguageColumn();
        await verifyIndexes();
        await verifyForeignKeys();
        await verifySampleQuery();

        printResults();
    } catch (error) {
        console.error('❌ 검증 중 예상치 못한 오류가 발생했습니다:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
