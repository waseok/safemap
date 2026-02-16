import { NextRequest, NextResponse } from "next/server";
import { createClientComponentClient } from "@/lib/supabase/client";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const classId = searchParams.get("class_id");
    const studentId = searchParams.get("student_id");
    const locationType = searchParams.get("location_type");

    if (!classId) {
      return NextResponse.json({ error: "class_id가 필요합니다." }, { status: 400 });
    }

    let query = supabaseAdmin
      .from("safety_pins")
      .select(`
        *,
        students(name)
      `)
      .eq("class_id", classId)
      .order("created_at", { ascending: false });

    if (studentId) {
      query = query.eq("student_id", studentId);
    }

    if (locationType) {
      query = query.eq("location_type", locationType);
    }

    const { data, error } = await query;

    if (error) {
      console.error("핀 조회 오류:", error);
      return NextResponse.json({ error: "조회 실패" }, { status: 500 });
    }

    return NextResponse.json({ pins: data || [] });
  } catch (error) {
    console.error("핀 조회 오류:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      class_id,
      student_id,
      location_type,
      category,
      title,
      description,
      latitude,
      longitude,
      address,
      image_url,
    } = body;

    if (!class_id || !student_id || !location_type || !category || !title) {
      return NextResponse.json(
        { error: "필수 필드가 누락되었습니다." },
        { status: 400 }
      );
    }

    // 마을일 때만 좌표 필요
    if (location_type === "마을" && (!latitude || !longitude)) {
      return NextResponse.json(
        { error: "마을 장소는 위치 정보가 필요합니다." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("safety_pins")
      .insert({
        class_id,
        student_id,
        location_type,
        category,
        title,
        description: description || "",
        latitude: location_type === "마을" ? latitude : null,
        longitude: location_type === "마을" ? longitude : null,
        address: location_type === "마을" ? address : null,
        image_url: image_url || "",
      })
      .select()
      .single();

    if (error) {
      console.error("핀 생성 오류:", error);
      return NextResponse.json({ error: "생성 실패" }, { status: 500 });
    }

    return NextResponse.json({ pin: data });
  } catch (error) {
    console.error("핀 생성 오류:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
