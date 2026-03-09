import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

// Vercel Cron Job이 이 엔드포인트를 매일 호출해 Supabase 프리 티어 자동 일시정지를 방지합니다.
// vercel.json 의 crons 설정으로 스케줄링됩니다.
export async function GET(request: Request) {
  // Vercel Cron 요청 인증 (CRON_SECRET 환경변수로 보호)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();

    // 가장 가벼운 쿼리로 DB 연결 확인
    const { error } = await supabase.from("classes").select("id").limit(1);

    if (error) {
      console.error("[keep-alive] DB 쿼리 실패:", error.message);
      return NextResponse.json(
        { ok: false, error: error.message, time: new Date().toISOString() },
        { status: 500 }
      );
    }

    console.log("[keep-alive] DB ping 성공:", new Date().toISOString());
    return NextResponse.json({ ok: true, time: new Date().toISOString() });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[keep-alive] 오류:", message);
    return NextResponse.json(
      { ok: false, error: message, time: new Date().toISOString() },
      { status: 500 }
    );
  }
}
