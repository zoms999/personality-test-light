import { NextResponse } from 'next/server';
import { verifyAdminCredentials, createSession, setSessionCookie } from '@/lib/admin-auth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: '아이디와 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    // Verify credentials
    if (!verifyAdminCredentials(username, password)) {
      return NextResponse.json(
        { success: false, error: '아이디 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    // Create session
    const token = await createSession();
    await setSessionCookie(token);

    return NextResponse.json({ success: true, message: '로그인 성공' });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: '로그인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
