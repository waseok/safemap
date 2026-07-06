import type { SupabaseClient } from "@supabase/supabase-js";
import { SAFE_CLASS_CODE } from "@/lib/explorer";

export const REVIEW_STUDENT_NAME = "심사 테스트";

export async function getOrCreateSafeClass(supabase: SupabaseClient) {
  const { data: existing, error: selectError } = await supabase
    .from("classes")
    .select("id, name, pin")
    .eq("pin", SAFE_CLASS_CODE)
    .maybeSingle();

  if (selectError) {
    throw new Error(`학급 확인 실패: ${selectError.message}`);
  }

  if (existing) {
    return existing;
  }

  const { data: created, error: createError } = await supabase
    .from("classes")
    .insert({
      pin: SAFE_CLASS_CODE,
      name: "SAFE 탐험반 (심사·체험)",
      teacher_id: null,
    })
    .select("id, name, pin")
    .single();

  if (createError) {
    throw new Error(`SAFE 학급 생성 실패: ${createError.message}`);
  }

  return created;
}

export function generateSessionId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
