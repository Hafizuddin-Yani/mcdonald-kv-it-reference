import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import type { DeviceType } from '../../types';

interface DeviceImageProps {
  device: DeviceType;
  className?: string;
  imgClassName?: string;
  /** Alt text override; defaults to the device full name. */
  alt?: string;
}

/**
 * Renders the first photo for a device. Falls back to a styled
 * placeholder (short name + icon) when no photo exists or it fails to load.
 */
export function DeviceImage({ device, className = '', imgClassName = '', alt }: DeviceImageProps) {
  const [error, setError] = useState(false);
  const photo = device.photos?.[0];
  const showImage = photo && !error;

  if (!showImage) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 bg-mcd-gray-100 dark:bg-mcd-gray-800 text-mcd-gray-400 ${className}`}
      >
        <ImageOff className="w-8 h-8" />
        <span className="font-mono text-sm font-bold tracking-wide">{device.shortName}</span>
        <span className="text-xs">No image yet</span>
      </div>
    );
  }

  return (
    <div className={`bg-mcd-gray-50 dark:bg-mcd-gray-800 overflow-hidden ${className}`}>
      <img
        src={photo}
        alt={alt ?? `${device.fullName} (${device.shortName})`}
        loading="lazy"
        onError={() => setError(true)}
        className={`w-full h-full object-cover ${imgClassName}`}
      />
    </div>
  );
}
