/**
 * Komprese obrázku v prohlížeči (Canvas) před uploadem do Storage.
 * Cíl: max. rozměr + JPEG s klesající kvalitou, dokud nespadne pod maxBytes.
 */

export type CompressImageOptions = {
  maxWidth?: number;
  maxHeight?: number;
  /** Výchozí kvalita JPEG (0–1). */
  quality?: number;
  /** Horní limit výsledku v bajtech. */
  maxBytes?: number;
};

const DEFAULTS: Required<CompressImageOptions> = {
  maxWidth: 1600,
  maxHeight: 1600,
  quality: 0.78,
  maxBytes: 420_000,
};

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Obrázek nejde načíst. Zkus JPG, PNG nebo WebP."));
    };
    img.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Komprese obrázku selhala."));
          return;
        }
        resolve(blob);
      },
      type,
      quality
    );
  });
}

function drawScaled(
  img: HTMLImageElement,
  maxWidth: number,
  maxHeight: number
): HTMLCanvasElement {
  let { width, height } = img;
  const scale = Math.min(1, maxWidth / width, maxHeight / height);
  width = Math.max(1, Math.round(width * scale));
  height = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas není dostupný.");
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);
  return canvas;
}

/**
 * Vrátí zmenšený JPEG (nebo původní soubor, pokud už je dost malý a není třeba měnit).
 */
export async function compressImageFile(
  file: File,
  options?: CompressImageOptions
): Promise<{ file: File; originalBytes: number; compressedBytes: number }> {
  const opts = { ...DEFAULTS, ...options };
  const originalBytes = file.size;

  if (!file.type.startsWith("image/") && !/\.(jpe?g|png|webp|gif)$/i.test(file.name)) {
    throw new Error("Vyber obrázek (JPG, PNG nebo WebP).");
  }

  // GIF animace / nepodporované formáty — necháme být, ale omezíme velikost
  if (file.type === "image/gif") {
    if (file.size > opts.maxBytes) {
      throw new Error("GIF je příliš velký. Nahraj JPG/PNG (max. cca 400 KB po kompresi).");
    }
    return { file, originalBytes, compressedBytes: file.size };
  }

  const img = await loadImage(file);
  const canvas = drawScaled(img, opts.maxWidth, opts.maxHeight);

  let quality = opts.quality;
  let blob = await canvasToBlob(canvas, "image/jpeg", quality);

  while (blob.size > opts.maxBytes && quality > 0.42) {
    quality = Math.max(0.42, quality - 0.1);
    blob = await canvasToBlob(canvas, "image/jpeg", quality);
  }

  // Pořád moc velké → ještě zmenši rozlišení
  if (blob.size > opts.maxBytes) {
    const smaller = drawScaled(img, Math.round(opts.maxWidth * 0.75), Math.round(opts.maxHeight * 0.75));
    quality = 0.7;
    blob = await canvasToBlob(smaller, "image/jpeg", quality);
    while (blob.size > opts.maxBytes && quality > 0.4) {
      quality = Math.max(0.4, quality - 0.1);
      blob = await canvasToBlob(smaller, "image/jpeg", quality);
    }
  }

  if (blob.size > opts.maxBytes * 1.35) {
    throw new Error(
      "Obrázek se nepodařilo dostatečně zmenšit. Zkus jiný / menší soubor."
    );
  }

  // Pokud je originál menší a už JPEG, nech ho (bez zbytečné rekomprese nahoru)
  if (
    originalBytes <= blob.size &&
    originalBytes <= opts.maxBytes &&
    (file.type === "image/jpeg" || file.type === "image/jpg")
  ) {
    return { file, originalBytes, compressedBytes: originalBytes };
  }

  const base = file.name.replace(/\.[^.]+$/, "") || "announcement";
  const out = new File([blob], `${base}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });

  return { file: out, originalBytes, compressedBytes: out.size };
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}
