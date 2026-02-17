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
      .from("solutions")
      .select(`
        *,
        students(name)
      `)
      .eq("safety_pin_id", safetyPinId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("해결방법 조회 오류:", error);
      return NextResponse.json({ error: "조회 실패" }, { status: 500 });
    }

    return NextResponse.json({ solutions: data || [] });
  } catch (error) {
    console.error("해결방법 조회 오류:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body = await request.json();
    const { safety_pin_id, student_id, type, content } = body;

    if (!safety_pin_id || !student_id || !type || !content) {
      return NextResponse.json(
        { error: "필수 필드가 누락되었습니다." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("solutions")
      .insert({
        safety_pin_id,
        student_id,
        type,
        content,
      })
      .select()
      .single();

    if (error) {
      console.error("해결방법 생성 오류:", error);
      return NextResponse.json({ error: "생성 실패" }, { status: 500 });
    }

    return NextResponse.json({ solution: data });
  } catch (error) {
    console.error("해결방법 생성 오류:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
