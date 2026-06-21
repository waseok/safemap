import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/** Vercel 함수 본문 한도(~4.2MB)에 맞춘 서버 측 상한 */
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        {
          error:
            "사진 용량이 너무 커요(4MB 초과). 앱에서 자동으로 줄이지만, 그래도 실패하면 다른 사진을 선택해 주세요.",
        },
        { status: 400 }
      );
    }

    // 파일명 생성 (특수문자 제거)
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^\w.\-가-힣]/g, "_");
    const filePath = `${timestamp}-${safeName}`;
    const bytes = new Uint8Array(await file.arrayBuffer());

    // Supabase Storage에 업로드
    const { error } = await supabase.storage
      .from("safety-pins")
      .upload(filePath, bytes, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || "application/octet-stream",
      });

    if (error) {
      console.error("업로드 오류:", error);
      return NextResponse.json(
        { error: `업로드 실패: ${error.message}` },
        { status: 500 }
      );
    }

    // 공개 URL 생성
    const {
      data: { publicUrl },
    } = supabase.storage.from("safety-pins").getPublicUrl(filePath);

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("업로드 오류:", error);
    const message = error instanceof Error ? error.message : "서버 오류";
    return NextResponse.json({ error: `서버 오류: ${message}` }, { status: 500 });
  }
}
