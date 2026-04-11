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

export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const classId = String(body?.classId ?? "").trim();
    const pin = String(body?.pin ?? "").trim();

    if (!classId || !pin) {
      return NextResponse.json({ error: "classId와 pin이 필요합니다." }, { status: 400 });
    }

    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json({ error: "PIN은 4자리 숫자여야 합니다." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("classes")
      .update({ pin })
      .eq("id", classId)
      .select()
      .single();

    if (error) {
      if ((error as any).code === "23505") {
        return NextResponse.json({ error: "이미 사용 중인 PIN입니다." }, { status: 409 });
      }
      console.error("학급 PIN 수정 오류:", error);
      return NextResponse.json({ error: `PIN 수정 실패: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ class: data });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "서버 오류";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
