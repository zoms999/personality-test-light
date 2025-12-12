import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { z } from 'zod';

// Schema for updating personality type
const updateTypeSchema = z.object({
  id: z.string().uuid(),
  translations: z.array(z.object({
    language_code: z.string().length(2),
    type_name: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    theme_sentence: z.string(),
    description_points: z.array(z.string()),
    strength_keywords: z.array(z.string()),
    weakness_keywords: z.array(z.string()),
  })).min(1),
});

export async function GET(req: NextRequest) {
  try {
    const types = await prisma.personalityTypes.findMany({
      include: {
        translations: true,
      },
      orderBy: {
        type_code: 'asc',
      },
    });

    return NextResponse.json({ success: true, data: types });
  } catch (error) {
    console.error('Failed to fetch personality types:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch personality types' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = updateTypeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors },
        { status: 400 }
      );
    }

    const { id, translations } = validation.data;

    const result = await prisma.$transaction(async (tx: any) => {
      // We don't update the type_code usually, just translations
      // Verify existence
      const type = await tx.personalityTypes.findUnique({ where: { id } });
      if (!type) {
        throw new Error('Personality Type not found');
      }

      // Update Translations (Upsert)
      for (const t of translations) {
        // Check if translation exists for this language
        const existingTrans = await tx.personalityTypeTranslations.findFirst({
          where: {
            personality_type_id: id,
            language_code: t.language_code
          }
        });

        if (existingTrans) {
          await tx.personalityTypeTranslations.update({
            where: { id: existingTrans.id },
            data: {
              type_name: t.type_name,
              title: t.title,
              description: t.description,
              theme_sentence: t.theme_sentence,
              description_points: t.description_points,
              strength_keywords: t.strength_keywords,
              weakness_keywords: t.weakness_keywords
            }
          });
        } else {
          await tx.personalityTypeTranslations.create({
            data: {
              personality_type_id: id,
              language_code: t.language_code,
              type_name: t.type_name,
              title: t.title,
              description: t.description,
              theme_sentence: t.theme_sentence,
              description_points: t.description_points,
              strength_keywords: t.strength_keywords,
              weakness_keywords: t.weakness_keywords
            }
          });
        }
      }

      return type;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Failed to update personality type:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update personality type' },
      { status: 500 }
    );
  }
}
