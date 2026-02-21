import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function generateSessionId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const step = body?.step as "pin" | "name" | undefined;

    if (step === "pin") {
      const pin = String(body?.pin ?? "").trim();
      if (!/^\d{4}$/.test(pin)) {
        return NextResponse.json({ error: "PIN은 4자리 숫자여야 합니다." }, { status: 400 });
      }

      const { data, error } = await supabase
        .from("classes")
        .select("id, name")
        .eq("pin", pin)
        .maybeSingle();

      if (error) {
        console.error("PIN 확인 오류:", error);
        return NextResponse.json(
          { error: `PIN 확인에 실패했습니다: ${error.message}` },
          { status: 500 }
        );
      }

      if (!data) {
        return NextResponse.json(
          { error: "올바른 PIN을 입력해주세요. (테스트 PIN이 아닌 실제 생성된 PIN인지 확인)" },
          { status: 404 }
        );
      }

      return NextResponse.json({ classId: data.id, className: data.name });
    }

    if (step === "name") {
      const classId = String(body?.classId ?? "").trim();
      const name = String(body?.name ?? "").trim();
      if (!classId || !name) {
        return NextResponse.json({ error: "classId와 name이 필요합니다." }, { status: 400 });
      }

      const { data: classData, error: classError } = await supabase
        .from("classes")
        .select("id")
        .eq("id", classId)
        .maybeSingle();
      if (classError) {
        return NextResponse.json({ error: `학급 확인 실패: ${classError.message}` }, { status: 500 });
      }
      if (!classData) {
        return NextResponse.json(
          { error: "학급 정보를 찾을 수 없습니다. PIN부터 다시 입력해주세요." },
          { status: 400 }
        );
      }

      const sessionId = generateSessionId();
      const { data, error } = await supabase
        .from("students")
        .insert({
          class_id: classId,
          name,
          session_id: sessionId,
        })
        .select("id")
        .single();

      if (error) {
        console.error("학생 입장 생성 오류:", error);
        return NextResponse.json({ error: `입장에 실패했습니다: ${error.message}` }, { status: 500 });
      }

      return NextResponse.json({ studentId: data.id, sessionId, classId });
    }

    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  } catch (error) {
    console.error("학생 입장 API 오류:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
