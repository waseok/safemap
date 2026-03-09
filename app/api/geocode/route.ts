import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// NCP Geocoding REST API를 서버사이드에서 호출합니다.
// Vercel 환경변수에 다음을 추가하세요:
//   NEXT_PUBLIC_NAVER_MAP_CLIENT_ID  (네이버 클라우드 Client ID)
//   NAVER_MAP_CLIENT_SECRET          (네이버 클라우드 Client Secret)
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query");
  if (!query?.trim()) {
    return NextResponse.json({ error: "query가 필요합니다." }, { status: 400 });
  }

  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
  const clientSecret = process.env.NAVER_MAP_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "네이버 지도 API 키가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(
      `https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(query.trim())}`,
      {
        headers: {
          "X-NCP-APIGW-API-KEY-ID": clientId,
          "X-NCP-APIGW-API-KEY": clientSecret,
        },
      }
    );

    if (!res.ok) {
      console.error("[geocode] NCP 응답 오류:", res.status, await res.text());
      return NextResponse.json({ coords: null });
    }

    const data = await res.json();
    const addresses: any[] = data.addresses ?? [];

    if (addresses.length === 0) {
      return NextResponse.json({ coords: null });
    }

    return NextResponse.json({
      coords: {
        lat: parseFloat(addresses[0].y),
        lng: parseFloat(addresses[0].x),
      },
    });
  } catch (err) {
    console.error("[geocode] 서버 오류:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
