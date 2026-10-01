import { createContext, useContext, useEffect, useState, type ReactNode, createElement } from 'react';

export type GlassIntensity = 'subtle' | 'standard' | 'strong' | 'maximum';

interface GlassConfig {
  intensity: GlassIntensity;
  setIntensity: (i: GlassIntensity) => void;
}

const STORAGE_KEY = 'mcdkv.glass.intensity';
const DEFAULT_INTENSITY: GlassIntensity = 'strong';

const intensityMap: Record<GlassIntensity, { blur: string; bgOpacity: string; bgStrongOpacity: string }> = {
  subtle: { blur: '8px', bgOpacity: '0.55', bgStrongOpacity: '0.7' },
  standard: { blur: '20px', bgOpacity: '0.72', bgStrongOpacity: '0.85' },
  strong: { blur: '40px', bgOpacity: '0.78', bgStrongOpacity: '0.92' },
  maximum: { blur: '60px', bgOpacity: '0.85', bgStrongOpacity: '0.96' },
};

function getInitial(): GlassIntensity {
  if (typeof window === 'undefined') return DEFAULT_INTENSITY;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored in intensityMap) return stored as GlassIntensity;
  } catch {}
  return DEFAULT_INTENSITY;
}

const GlassContext = createContext<GlassConfig | null>(null);

export function GlassProvider({ children }: { children: ReactNode }) {
  const [intensity, setIntensityState] = useState<GlassIntensity>(getInitial);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    setResolved(true);
    const stored = getInitial();
    setIntensityState(stored);
    applyIntensity(stored);
  }, []);

  useEffect(() => {
    if (!resolved) return;
    try {
      localStorage.setItem(STORAGE_KEY, intensity);
    } catch {}
    applyIntensity(intensity);
  }, [intensity, resolved]);

  const setIntensity = (i: GlassIntensity) => setIntensityState(i);

  const value = { intensity, setIntensity };
  return createElement(GlassContext.Provider, { value }, children);
}

function applyIntensity(i: GlassIntensity) {
  if (typeof document === 'undefined') return;
  const { blur, bgOpacity, bgStrongOpacity } = intensityMap[i];
  const root = document.documentElement;
  root.style.setProperty('--glass-blur', blur);
  root.style.setProperty('--glass-bg-opacity', bgOpacity);
  root.style.setProperty('--glass-bg-strong-opacity', bgStrongOpacity);
}

export function useGlass(): GlassConfig {
  const ctx = useContext(GlassContext);
  if (!ctx) throw new Error('useGlass must be used within GlassProvider');
  return ctx;
}

export function glassIntensityLabel(i: GlassIntensity): string {
  switch (i) {
    case 'subtle': return 'Subtle (light blur)';
    case 'standard': return 'Standard';
    case 'strong': return 'Strong (macOS-like)';
    case 'maximum': return 'Maximum (heavy blur)';
    default: return i;
  }
}