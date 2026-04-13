import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      code,
      redirectUri,
      role,
      name,
      nickname,
      phoneNumber,
      storeName,
      storePhoneNumber,
    } = body;

    if (!code || !redirectUri) {
      return NextResponse.json(
        { error: '유효하지 않은 요청입니다.' },
        { status: 400 }
      );
    }

    const API_URL =
      process.env.NEXT_PUBLIC_API_URL ||
      'https://fe-project-albaform.vercel.app/';
    const TEAM_ID = process.env.NEXT_PUBLIC_TEAM_ID || '15-3';
    const baseURL = `${API_URL}${TEAM_ID}/`;

    const signUpData = {
      token: code,
      redirectUri,
      role,
      name,
      nickname,
      phoneNumber,
      location: '',
      storeName: storeName || '',
      storePhoneNumber: storePhoneNumber || '',
    };

    const response = await fetch(`${baseURL}oauth/sign-up/kakao`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signUpData),
    });

    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error(
        'Kakao OAuth 회원가입 실패:',
        response.status,
        responseData
      );
      return NextResponse.json(
        { error: '회원가입에 실패했습니다.', detail: responseData },
        { status: response.status }
      );
    }

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Kakao OAuth 회원가입 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
