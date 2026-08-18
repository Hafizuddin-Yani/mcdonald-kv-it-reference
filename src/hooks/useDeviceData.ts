import { useEffect, useState } from 'react';
import { deviceTypes } from '../data/deviceTypes';
import type { DeviceType } from '../types';

export function useDeviceType(typeId: string | undefined): DeviceType | undefined {
  const [device, setDevice] = useState<DeviceType | undefined>(undefined);

  useEffect(() => {
    if (!typeId) {
      setDevice(undefined);
      return;
    }
    setDevice(
      deviceTypes.find((d) => d.id === typeId || d.shortName.toLowerCase() === typeId.toLowerCase())
    );
  }, [typeId]);

  return device;
}

export function useDeviceTypes(): DeviceType[] {
  return deviceTypes;
}
