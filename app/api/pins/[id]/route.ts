import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id } = params;

    const { data, error } = await supabaseAdmin
      .from("safety_pins")
      .select(`
        *,
        students(name)
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("핀 조회 오류:", error);
      return NextResponse.json({ error: "조회 실패" }, { status: 500 });
    }

    return NextResponse.json({ pin: data });
  } catch (error) {
    console.error("핀 조회 오류:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id } = params;
    const body = await request.json();
    const { title, description, image_url, student_name } = body;

    // 핀 수정
    const updateFields: Record<string, string> = {};
    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (image_url !== undefined) updateFields.image_url = image_url;

    if (Object.keys(updateFields).length > 0) {
      const { error } = await supabaseAdmin
        .from("safety_pins")
        .update(updateFields)
        .eq("id", id);

      if (error) {
        console.error("핀 수정 오류:", error);
        return NextResponse.json({ error: "수정 실패" }, { status: 500 });
      }
    }

    // 학생 이름 수정
    if (student_name !== undefined) {
      const { data: pinData } = await supabaseAdmin
        .from("safety_pins")
        .select("student_id")
        .eq("id", id)
        .single();

      if (pinData?.student_id) {
        const { error: nameError } = await supabaseAdmin
          .from("students")
          .update({ name: student_name })
          .eq("id", pinData.student_id);

        if (nameError) {
          console.error("이름 수정 오류:", nameError);
          return NextResponse.json({ error: "이름 수정 실패" }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("핀 수정 오류:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id } = params;

    const { error } = await supabaseAdmin
      .from("safety_pins")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("핀 삭제 오류:", error);
      return NextResponse.json({ error: "삭제 실패" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("핀 삭제 오류:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
