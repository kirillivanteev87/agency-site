/** Соотношение сторон обложки кейса на главной (aspect-[4/3]) */
export const CASE_COVER_ASPECT = 4 / 3;

export type CropArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", () => reject(new Error("Не удалось загрузить изображение")));
    if (!url.startsWith("blob:")) {
      img.setAttribute("crossOrigin", "anonymous");
    }
    img.src = url;
  });
}

/** Экспорт области кропа в JPEG для загрузки на сервер */
export async function getCroppedImageBlob(
  imageSrc: string,
  pixelCrop: CropArea,
  maxWidth = 1600,
  quality = 0.9,
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas не поддерживается");

  let outW = pixelCrop.width;
  let outH = pixelCrop.height;
  if (outW > maxWidth) {
    outH = Math.round((outH * maxWidth) / outW);
    outW = maxWidth;
  }

  canvas.width = outW;
  canvas.height = outH;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outW,
    outH,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Не удалось сжать изображение"));
      },
      "image/jpeg",
      quality,
    );
  });
}

export function blobToFile(blob: Blob, name: string): File {
  return new File([blob], name, { type: blob.type || "image/jpeg" });
}
