import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const result: Record<string, unknown> = {};

  try {
    result.env = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "설정됨" : "미설정",
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "설정됨 (길이: " + process.env.SUPABASE_SERVICE_ROLE_KEY.length + ")" : "미설정",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "설정됨" : "미설정",
    };
  } catch {
    result.env = "환경변수 확인 실패";
  }

  try {
    const supabase = getSupabaseAdmin();

    const { data: classes, error: classesError } = await supabase
      .from("classes")
      .select("id, pin, name, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    result.classes = {
      count: classes?.length ?? 0,
      data: classes || [],
      error: classesError?.message || null,
    };
  } catch (err: unknown) {
    result.classes = { error: err instanceof Error ? err.message : String(err) };
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: students, error: studentsError } = await supabase
      .from("students")
      .select("id, class_id, name, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    result.students = {
      count: students?.length ?? 0,
      data: students || [],
      error: studentsError?.message || null,
    };
  } catch (err: unknown) {
    result.students = { error: err instanceof Error ? err.message : String(err) };
  }

  return NextResponse.json(result, { status: 200 });
}
