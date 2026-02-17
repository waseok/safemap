import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase Admin 클라이언트 (지연 생성)
 * - 빌드 시점에 createClient 호출 방지 → Vercel 빌드 에러 해결
 * - 런타임에만 호출되므로 env 변수 사용 가능
 */
export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.");
  }
  return createClient(url, key);
}
