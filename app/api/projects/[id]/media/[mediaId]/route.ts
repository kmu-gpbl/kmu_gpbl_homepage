import { NextRequest, NextResponse } from "next/server";
import { projectMediaApi } from "@/lib/supabase-api";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; mediaId: string }> }
) {
  try {
    const { id, mediaId } = await params;
    const body = await request.json();

    // 필수 필드 검증
    if (!body.type || !body.title || !body.url) {
      return NextResponse.json(
        { error: "필수 필드가 누락되었습니다." },
        { status: 400 }
      );
    }

    // 미디어 업데이트 데이터
    const updateData = {
      type: body.type,
      title: body.title,
      url: body.url,
      description: body.description || "",
    };

    // Supabase에서 미디어 업데이트
    const updatedMedia = await projectMediaApi.update(mediaId, updateData);

    return NextResponse.json(
      {
        message: "미디어가 성공적으로 수정되었습니다.",
        media: updatedMedia,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("미디어 수정 실패:", error);
    return NextResponse.json(
      { error: "미디어 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; mediaId: string }> }
) {
  try {
    const { id, mediaId } = await params;

    // Supabase에서 미디어 삭제
    await projectMediaApi.delete(mediaId);

    return NextResponse.json(
      {
        message: "미디어가 성공적으로 삭제되었습니다.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("미디어 삭제 실패:", error);
    return NextResponse.json(
      { error: "미디어 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
