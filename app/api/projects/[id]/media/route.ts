import { NextRequest, NextResponse } from "next/server";
import { projectMediaApi } from "@/lib/supabase-api";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 필수 필드 검증
    if (!body.type || !body.title || !body.url) {
      return NextResponse.json(
        { error: "필수 필드가 누락되었습니다." },
        { status: 400 }
      );
    }

    // 새 미디어 객체 생성
    const newMedia = {
      project_id: id,
      type: body.type,
      title: body.title,
      url: body.url,
      description: body.description || "",
      file_name: null,
      original_name: null,
    };

    // Supabase에 미디어 추가
    const createdMedia = await projectMediaApi.create(newMedia);

    return NextResponse.json(
      {
        message: "미디어가 성공적으로 추가되었습니다.",
        media: createdMedia,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("미디어 추가 실패:", error);
    return NextResponse.json(
      { error: "미디어 추가 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
