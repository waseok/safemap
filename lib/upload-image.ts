import { compressImageForUpload } from "@/lib/compress-image";

/** 서버·Vercel과 동일한 상한 (바이트) */
export const UPLOAD_MAX_BYTES = 4 * 1024 * 1024;

function formatUploadError(status: number, message?: string): string {
  if (status === 413) {
    return "사진 용량이 너무 커서 업로드할 수 없어요. 다른 사진을 선택하거나 카메라 해상도를 낮춰 주세요.";
  }
  if (message) {
    return message;
  }
  return "사진 업로드에 실패했어요. 잠시 후 다시 시도해 주세요.";
}

/**
 * 사진을 자동 압축한 뒤 /api/upload 로 올리고 공개 URL을 반환합니다.
 */
export async function uploadImageFile(file: File): Promise<string> {
  const compressed = await compressImageForUpload(file);

  const formData = new FormData();
  formData.append("file", compressed);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(formatUploadError(res.status, data.error));
  }

  const data = await res.json();
  if (!data.url) {
    throw new Error("업로드는 됐지만 주소를 받지 못했어요. 다시 시도해 주세요.");
  }

  return data.url as string;
}
