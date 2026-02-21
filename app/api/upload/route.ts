import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "파일 크기는 10MB 이하여야 합니다." }, { status: 400 });
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
