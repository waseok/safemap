import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

// 환경 변수 체크
function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    console.warn('NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다.');
    return 'https://placeholder.supabase.co';
  }
  return url;
}

function getSupabaseAnonKey() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    console.warn('NEXT_PUBLIC_SUPABASE_ANON_KEY가 설정되지 않았습니다.');
    return 'placeholder-key';
  }
  return key;
}

// 브라우저 클라이언트 (클라이언트 컴포넌트용)
export function createClientComponentClient() {
  return createBrowserClient(
    getSupabaseUrl(),
    getSupabaseAnonKey()
  )
}

// 서버 액션용 클라이언트
export function createServerActionClient() {
  return createClient(
    getSupabaseUrl(),
    getSupabaseAnonKey()
  )
}
