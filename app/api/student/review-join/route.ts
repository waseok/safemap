import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  REVIEW_STUDENT_NAME,
  generateSessionId,
  getOrCreateSafeClass,
} from "@/lib/safe-class";

export const dynamic = "force-dynamic";

/**
 * 앱 심사·체험용 원클릭 입장.
 * PIN·이름 입력 없이 데모 학급(SAFE_CLASS_CODE)에 실제 학생 세션을 발급합니다.
 */
export async function POST() {
  try {
    if (process.env.ENABLE_REVIEW_ENTRY === "false") {
      return NextResponse.json({ error: "심사용 테스트 입장이 비활성화되어 있습니다." }, { status: 403 });
    }

    const supabase = getSupabaseAdmin();
    const classData = await getOrCreateSafeClass(supabase);
    const studentName = process.env.REVIEW_STUDENT_NAME?.trim() || REVIEW_STUDENT_NAME;
    const sessionId = generateSessionId();

    const { data: existing, error: lookupError } = await supabase
      .from("students")
      .select("id")
      .eq("class_id", classData.id)
      .eq("name", studentName)
      .maybeSingle();

    if (lookupError) {
      return NextResponse.json({ error: `학생 확인 실패: ${lookupError.message}` }, { status: 500 });
    }

    let studentId = existing?.id;

    if (studentId) {
      const { error: updateError } = await supabase
        .from("students")
        .update({ session_id: sessionId })
        .eq("id", studentId);

      if (updateError) {
        return NextResponse.json({ error: `세션 갱신 실패: ${updateError.message}` }, { status: 500 });
      }
    } else {
      const { data: created, error: createError } = await supabase
        .from("students")
        .insert({
          class_id: classData.id,
          name: studentName,
          session_id: sessionId,
        })
        .select("id")
        .single();

      if (createError) {
        return NextResponse.json({ error: `입장에 실패했습니다: ${createError.message}` }, { status: 500 });
      }

      studentId = created.id;
    }

    return NextResponse.json({
      studentId,
      sessionId,
      classId: classData.id,
      classCode: classData.pin,
      className: classData.name,
      studentName,
      isReview: true,
    });
  } catch (error) {
    console.error("심사용 입장 API 오류:", error);
    const message = error instanceof Error ? error.message : "서버 오류";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
