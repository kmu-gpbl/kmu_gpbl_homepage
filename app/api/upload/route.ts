import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
    }

    // 파일 크기 제한 (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "파일 크기는 10MB를 초과할 수 없습니다." },
        { status: 400 }
      );
    }

    // 허용된 파일 타입
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "지원하지 않는 파일 타입입니다." },
        { status: 400 }
      );
    }

    // 파일명 생성 (중복 방지)
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split(".").pop();
    const fileName = `${timestamp}_${randomString}.${fileExtension}`;

    // Supabase Storage에 파일 업로드
    const { data, error } = await supabase.storage
      .from("project-media")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Supabase Storage 업로드 실패:", error);

      // 버킷이 없는 경우 더 자세한 안내
      if (error.message?.includes("Bucket not found")) {
        return NextResponse.json(
          {
            error: "Storage 버킷이 설정되지 않았습니다. 관리자에게 문의하세요.",
            details:
              "Supabase Storage에서 'project-media' 버킷을 생성해야 합니다.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: "파일 업로드 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    // 파일 URL 가져오기
    const { data: urlData } = supabase.storage
      .from("project-media")
      .getPublicUrl(fileName);

    return NextResponse.json({
      message: "파일이 성공적으로 업로드되었습니다.",
      url: urlData.publicUrl,
      fileName: fileName,
      originalName: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("파일 업로드 실패:", error);
    return NextResponse.json(
      { error: "파일 업로드 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
