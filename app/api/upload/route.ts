import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
    }

    // 파일명 생성
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    const filePath = `safety-pins/${fileName}`;

    // Supabase Storage에 업로드
    const { data, error } = await supabase.storage
      .from("safety-pins")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("업로드 오류:", error);
      return NextResponse.json({ error: "업로드 실패" }, { status: 500 });
    }

    // 공개 URL 생성
    const {
      data: { publicUrl },
    } = supabase.storage.from("safety-pins").getPublicUrl(filePath);

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("업로드 오류:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
