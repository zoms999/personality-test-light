import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for creating a question
const createQuestionSchema = z.object({
  personality_type_id: z.string().uuid(),
  question_order_in_type: z.number().int().min(1),
  is_active: z.boolean().default(true),
  translations: z.array(z.object({
    language_code: z.string().length(2), // e.g., 'ko', 'en'
    question_text: z.string().min(1),
  })).min(1),
});

export async function GET(req: NextRequest) {
  try {
    const questions = await prisma.questions.findMany({
      include: {
        personality_type: {
          select: {
            type_code: true,
            translations: {
              where: { language_code: 'ko' },
              select: { type_name: true }
            }
          }
        },
        translations: true,
      },
      orderBy: [
        { personality_type: { type_code: 'asc' } },
        { question_order_in_type: 'asc' },
      ],
    });

    return NextResponse.json({ success: true, data: questions });
  } catch (error) {
    console.error('Failed to fetch questions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = createQuestionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors },
        { status: 400 }
      );
    }

    const { personality_type_id, question_order_in_type, is_active, translations } = validation.data;

    const result = await prisma.$transaction(async (tx: any) => {
      // Create Question
      const question = await tx.questions.create({
        data: {
          personality_type_id,
          question_order_in_type,
          is_active,
        },
      });

      // Create Translations
      if (translations.length > 0) {
        await tx.questionTranslations.createMany({
          data: translations.map((t) => ({
            question_id: question.id,
            language_code: t.language_code,
            question_text: t.question_text,
          })),
        });
      }

      return question;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Failed to create question:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create question' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    // Re-use create schema but add ID validation if needed or just use it for payload validation
    const updateSchema = createQuestionSchema.extend({
      id: z.number().int(),
    });

    const validation = updateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors },
        { status: 400 }
      );
    }

    const { id, personality_type_id, question_order_in_type, is_active, translations } = validation.data;

    const result = await prisma.$transaction(async (tx: any) => {
      // Update Question
      const question = await tx.questions.update({
        where: { id },
        data: {
          personality_type_id,
          question_order_in_type,
          is_active,
        },
      });

      // Update Translations (Upsert)
      for (const t of translations) {
        // Check if translation exists for this language
        const existingTrans = await tx.questionTranslations.findFirst({
          where: {
            question_id: id,
            language_code: t.language_code
          }
        });

        if (existingTrans) {
          await tx.questionTranslations.update({
             where: { id: existingTrans.id },
             data: { question_text: t.question_text }
          });
        } else {
           await tx.questionTranslations.create({
             data: {
               question_id: id,
               language_code: t.language_code,
               question_text: t.question_text
             }
           });
        }
      }

      return question;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Failed to update question:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update question' },
      { status: 500 }
    );
  }
}
