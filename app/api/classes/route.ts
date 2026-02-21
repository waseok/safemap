import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function generatePin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("classes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("학급 조회 오류:", error);
      return NextResponse.json({ error: `조회 실패: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ classes: data || [] });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "서버 오류";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const name = String(body?.name ?? "").trim();

    if (!name) {
      return NextResponse.json({ error: "학급명을 입력해주세요." }, { status: 400 });
    }

    let pin = "";
    let attempts = 0;
    while (attempts < 20) {
      const candidate = generatePin();
      const { data: existing } = await supabase
        .from("classes")
        .select("id")
        .eq("pin", candidate)
        .maybeSingle();

      if (!existing) {
        pin = candidate;
        break;
      }
      attempts++;
    }

    if (!pin) {
      return NextResponse.json({ error: "PIN 생성에 실패했습니다. 다시 시도해주세요." }, { status: 500 });
    }

    const { data, error } = await supabase
      .from("classes")
      .insert({
        pin,
        name,
        teacher_id: null,
      })
      .select()
      .single();

    if (error) {
      console.error("학급 생성 오류:", error);
      return NextResponse.json({ error: `학급 생성 실패: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ class: data });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "서버 오류";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
