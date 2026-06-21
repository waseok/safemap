/** Vercel 함수 한도(~4.2MB) 아래로 여유 있게 맞춤 */
export const UPLOAD_TARGET_MAX_BYTES = 3.5 * 1024 * 1024;

/** 긴 변 기준 최대 픽셀 */
const MAX_DIMENSION = 1920;
const MIN_DIMENSION = 960;
const MIN_QUALITY = 0.45;

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("이미지 변환에 실패했어요."))),
      type,
      quality
    );
  });
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("이미지를 불러올 수 없어요. JPG/PNG 사진을 선택해 주세요."));
    };
    img.src = url;
  });
}

function scaleDimensions(width: number, height: number, maxDim: number) {
  if (width <= maxDim && height <= maxDim) {
    return { width, height };
  }
  const ratio = Math.min(maxDim / width, maxDim / height);
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}

async function renderToJpegBlob(
  source: CanvasImageSource,
  width: number,
  height: number,
  quality: number
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("이미지 처리에 실패했어요.");
  }
  ctx.drawImage(source, 0, 0, width, height);
  return canvasToBlob(canvas, "image/jpeg", quality);
}

/**
 * 업로드 전 사진 용량·해상도를 자동으로 줄입니다.
 * Vercel 서버리스 한도를 넘지 않도록 JPEG로 변환합니다.
 */
export async function compressImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    throw new Error("이미지 파일만 업로드할 수 있어요.");
  }

  // 이미 충분히 작은 JPEG/PNG/WebP는 그대로 사용
  if (
    file.size <= UPLOAD_TARGET_MAX_BYTES &&
    /image\/(jpeg|jpg|png|webp)/i.test(file.type)
  ) {
    return file;
  }

  const img = await loadImageElement(file);
  let maxDim = MAX_DIMENSION;
  let quality = 0.82;
  let { width, height } = scaleDimensions(img.width, img.height, maxDim);
  let blob = await renderToJpegBlob(img, width, height, quality);

  // 품질을 낮춰 목표 용량 맞추기
  while (blob.size > UPLOAD_TARGET_MAX_BYTES && quality > MIN_QUALITY) {
    quality -= 0.08;
    const { width, height } = scaleDimensions(img.width, img.height, maxDim);
    blob = await renderToJpegBlob(img, width, height, quality);
  }

  // 그래도 크면 해상도를 더 줄임
  while (blob.size > UPLOAD_TARGET_MAX_BYTES && maxDim > MIN_DIMENSION) {
    maxDim = Math.round(maxDim * 0.75);
    quality = 0.78;
    const { width, height } = scaleDimensions(img.width, img.height, maxDim);
    blob = await renderToJpegBlob(img, width, height, quality);
    while (blob.size > UPLOAD_TARGET_MAX_BYTES && quality > MIN_QUALITY) {
      quality -= 0.08;
      blob = await renderToJpegBlob(img, width, height, quality);
    }
  }

  if (blob.size > UPLOAD_TARGET_MAX_BYTES) {
    throw new Error(
      "사진 용량을 자동으로 줄였지만 여전히 너무 커요. 다른 사진을 선택하거나 카메라 해상도를 낮춰 주세요."
    );
  }

  const baseName = file.name.replace(/\.[^.]+$/i, "") || "photo";
  return new File([blob], `${baseName}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}
