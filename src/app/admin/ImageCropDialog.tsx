"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { formatCropAspectLabel, getCroppedImageBlob } from "@/lib/crop-image";

type Props = {
  open: boolean;
  imageSrc: string;
  aspect: number;
  title?: string;
  onClose: () => void;
  onConfirm: (blob: Blob) => void | Promise<void>;
};

export function ImageCropDialog({ open, imageSrc, aspect, title = "Обрезка обложки", onClose, onConfirm }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  if (!open) return null;

  async function handleApply() {
    if (!croppedAreaPixels) return;
    setBusy(true);
    setError("");
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels);
      await onConfirm(blob);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка обрезки");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-crop-overlay" role="dialog" aria-modal="true" aria-labelledby="admin-crop-title">
      <div className="admin-crop-dialog">
        <div className="admin-crop-head">
          <h2 id="admin-crop-title" className="text-lg font-semibold">
            {title}
          </h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Перетащите и масштабируйте — на сайте видна только выделенная область ({formatCropAspectLabel(aspect)}).
          </p>
        </div>

        <div className="admin-crop-stage">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <label className="admin-crop-zoom">
          Масштаб
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          />
        </label>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <div className="admin-crop-actions">
          <button type="button" className="btn-outline text-sm" disabled={busy} onClick={onClose}>
            Отмена
          </button>
          <button type="button" className="btn-primary text-sm" disabled={busy} onClick={() => void handleApply()}>
            {busy ? "Сохранение…" : "Применить обрезку"}
          </button>
        </div>
      </div>
    </div>
  );
}
