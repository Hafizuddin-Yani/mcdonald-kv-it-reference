import { useEffect, useState } from 'react';
import { ZoomIn, X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { DeviceType } from '../../types';
import { DeviceImage } from './DeviceImage';

interface DevicePhotoGalleryProps {
  device: DeviceType;
}

/**
 * Shows all photos for a device. Click any photo to open a full-screen
 * lightbox with prev/next navigation; Escape or the close button exits.
 */
export function DevicePhotoGallery({ device }: DevicePhotoGalleryProps) {
  const photos = device.photos ?? [];
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActive(null);
      if (e.key === 'ArrowLeft') setActive((i) => (i === null ? i : (i + photos.length - 1) % photos.length));
      if (e.key === 'ArrowRight') setActive((i) => (i === null ? i : (i + 1) % photos.length));
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [active, photos.length]);

  if (photos.length === 0) {
    return (
      <DeviceImage
        device={device}
        className="h-56 w-full rounded-lg"
        alt={device.fullName}
      />
    );
  }

  return (
    <div>
      <div className="grid gap-3">
        {photos.map((src, i) => (
          <button
            key={src + i}
            type="button"
            onClick={() => setActive(i)}
            className="relative group w-full rounded-lg overflow-hidden border border-mcd-gray-200 dark:border-mcd-gray-700 focus:outline-none focus:ring-2 focus:ring-mcd-red"
            title="Click to zoom"
          >
            <img
              src={src}
              alt={`${device.fullName} (${device.shortName}) view ${i + 1}`}
              className="w-full h-64 sm:h-80 object-cover"
              loading="lazy"
            />
            <span className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1.5 bg-white/90 text-mcd-gray-900 text-xs font-medium px-3 py-1.5 rounded-full">
                <ZoomIn className="w-3.5 h-3.5" /> Click to zoom
              </span>
            </span>
          </button>
        ))}
      </div>

      {active !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
            onClick={() => setActive(null)}
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>

          {photos.length > 1 && (
            <>
              <button
                type="button"
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  setActive((i) => (i === null ? i : (i + photos.length - 1) % photos.length));
                }}
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  setActive((i) => (i === null ? i : (i + 1) % photos.length));
                }}
                aria-label="Next photo"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <img
            src={photos[active]}
            alt={`${device.fullName} (${device.shortName}) view ${active + 1}`}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
