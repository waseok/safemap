import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const searchParams = request.nextUrl.searchParams;
    const safetyPinId = searchParams.get("safety_pin_id");

    if (!safetyPinId) {
      return NextResponse.json({ error: "safety_pin_id가 필요합니다." }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("teacher_feedbacks")
      .select("*")
      .eq("safety_pin_id", safetyPinId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116은 결과가 없을 때 발생하는 오류
      console.error("피드백 조회 오류:", error);
      return NextResponse.json({ error: "조회 실패" }, { status: 500 });
    }

    return NextResponse.json({ feedback: data || null });
  } catch (error) {
    console.error("피드백 조회 오류:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    // JWT로 인증 (cookies/SSR 제거 - Vercel 빌드 에러 방지)
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace(/^Bearer\s+/i, "");

    if (!token) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const body = await request.json();
    const { safety_pin_id, feedback } = body;

    if (!safety_pin_id || !feedback) {
      return NextResponse.json(
        { error: "필수 필드가 누락되었습니다." },
        { status: 400 }
      );
    }

    // 기존 피드백 확인
    const { data: existing } = await supabaseAdmin
      .from("teacher_feedbacks")
      .select("id")
      .eq("safety_pin_id", safety_pin_id)
      .eq("teacher_id", user.id)
      .single();

    let result;
    if (existing) {
      // 업데이트
      const { data, error } = await supabaseAdmin
        .from("teacher_feedbacks")
        .update({ feedback, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // 생성
      const { data, error } = await supabaseAdmin
        .from("teacher_feedbacks")
        .insert({
          safety_pin_id,
          teacher_id: user.id,
          feedback,
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return NextResponse.json({ feedback: result });
  } catch (error: any) {
    console.error("피드백 저장 오류:", error);
    return NextResponse.json({ error: error.message || "서버 오류" }, { status: 500 });
  }
}
