import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
