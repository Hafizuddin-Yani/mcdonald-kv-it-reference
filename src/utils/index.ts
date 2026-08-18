import { deviceCategories } from '../data/deviceTypes';
import { districtLabels, formatLabels } from '../data/stores';
import type { DeviceCategory, DeviceType, District, StoreFormat } from '../types';

/** Format a district code to a readable label. */
export function formatDistrict(district: District): string {
  return districtLabels[district] ?? district;
}

/** Format a store format code to a readable label. */
export function formatStoreFormat(format: StoreFormat): string {
  return formatLabels[format] ?? format;
}

/** Format a device category code to a readable label. */
export function formatCategory(category: DeviceCategory): string {
  return deviceCategories[category] ?? category;
}

/** Build the ticket display name for a store, e.g. "#424 Amerin Balakong DT". */
export function storeDisplayName(number: string, name: string, format: StoreFormat): string {
  const fmt = format === 'DT' ? ' DT' : '';
  return `#${number} ${name}${fmt}`;
}

/** Standard asset tag, e.g. MY-KV-424-COD-01. */
export function buildAssetTag(
  region: string,
  storeNumber: string,
  deviceCode: string,
  index?: number
): string {
  const idx = index ? String(index).padStart(2, '0') : '';
  const parts = ['MY', region, storeNumber, deviceCode, idx].filter(Boolean);
  return parts.join('-');
}

/** Parse a device short name that may include an index, e.g. "COD 2" -> {name:'COD', index:2}. */
export function parseDeviceName(input: string): { name: string; index?: number } {
  const match = input.trim().match(/^(.+?)\s*(\d+)?$/);
  if (!match) return { name: input.trim() };
  const [, name, idx] = match;
  return { name: name.trim(), index: idx ? parseInt(idx, 10) : undefined };
}

/** Shorten a phone number to something tappable (remove spaces/dashes/+). */
export function telLink(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

/** Format an ISO date string for display. */
export function formatDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Class name helper. */
export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

/** Lightweight severity color mapping. */
export function priorityColor(priority: string): string {
  switch (priority) {
    case 'CRITICAL':
      return 'badge-red';
    case 'HIGH':
      return 'badge-red';
    case 'NORMAL':
      return 'badge-yellow';
    default:
      return 'badge-gray';
  }
}

export function statusColor(status: string): string {
  switch (status) {
    case 'OPEN':
    case 'IN_PROGRESS':
      return 'badge-yellow';
    case 'RESOLVED':
      return 'badge-green';
    default:
      return 'badge-gray';
  }
}

/** Group device types by category for listing pages. */
export function groupByCategory(types: DeviceType[]): Record<string, DeviceType[]> {
  return types.reduce<Record<string, DeviceType[]>>((acc, t) => {
    (acc[t.category] = acc[t.category] || []).push(t);
    return acc;
  }, {});
}
