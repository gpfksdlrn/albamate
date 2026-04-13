import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code, redirectUri } = await request.json();

    if (!code || !redirectUri) {
      return NextResponse.json(
        { error: '필수 파라미터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const API_URL =
      process.env.NEXT_PUBLIC_API_URL ||
      'https://fe-project-albaform.vercel.app/';
    const TEAM_ID = process.env.NEXT_PUBLIC_TEAM_ID || '15-3';
    const baseURL = `${API_URL}${TEAM_ID}/`;

    const response = await fetch(`${baseURL}oauth/sign-in/kakao`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: code, redirectUri }),
    });

    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { error: '로그인에 실패했습니다.', detail: responseData },
        { status: response.status }
      );
    }

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Kakao OAuth 로그인 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
