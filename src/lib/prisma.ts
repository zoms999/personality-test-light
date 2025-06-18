import { PrismaClient } from '@/generated/prisma';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 환경변수 명시적 로드 및 에러 핸들링
const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:1111@localhost:5433/findme?schema=public";

console.log('DATABASE_URL 확인:', databaseUrl ? '설정됨' : '설정안됨');

if (!databaseUrl) {
  throw new Error('DATABASE_URL 환경변수가 설정되지 않았습니다.');
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma; 