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
      .order("created_at", { ascending: false });

    if (error) {
      console.error("피드백 조회 오류:", error);
      return NextResponse.json({ error: `조회 실패: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ feedbacks: data || [], feedback: data?.[0] || null });
  } catch (error) {
    console.error("피드백 조회 오류:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body = await request.json();
    const { safety_pin_id, feedback, class_id } = body;

    if (!safety_pin_id || !feedback) {
      return NextResponse.json(
        { error: "필수 필드가 누락되었습니다." },
        { status: 400 }
      );
    }

    const { data: existing } = await supabaseAdmin
      .from("teacher_feedbacks")
      .select("id")
      .eq("safety_pin_id", safety_pin_id)
      .maybeSingle();

    let result;
    if (existing) {
      const { data, error } = await supabaseAdmin
        .from("teacher_feedbacks")
        .update({ feedback, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: `수정 실패: ${error.message}` }, { status: 500 });
      }
      result = data;
    } else {
      const { data, error } = await supabaseAdmin
        .from("teacher_feedbacks")
        .insert({
          safety_pin_id,
          teacher_id: null,
          feedback,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: `생성 실패: ${error.message}` }, { status: 500 });
      }
      result = data;
    }

    return NextResponse.json({ feedback: result });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "서버 오류";
    console.error("피드백 저장 오류:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
