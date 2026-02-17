import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id } = params;

    const { data, error } = await supabaseAdmin
      .from("safety_pins")
      .select(`
        *,
        students(name)
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("핀 조회 오류:", error);
      return NextResponse.json({ error: "조회 실패" }, { status: 500 });
    }

    return NextResponse.json({ pin: data });
  } catch (error) {
    console.error("핀 조회 오류:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
