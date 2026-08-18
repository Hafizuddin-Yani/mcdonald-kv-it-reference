import type { Store, StoreFormat, District } from '../types';

/**
 * Klang Valley store master list.
 *
 * NOTE: Replace the sample data below with your real store list.
 * Keep the structure the same - add rows to the compact `seedStores`
 * array and run the build to regenerate `stores.ts` data if needed.
 *
 * Source of truth should be: your ticket history, internal store
 * directory, and site visits.
 */

interface StoreSeed {
  number: string;
  name: string;
  format: StoreFormat;
  district: District;
  address?: string;
  lat: number;
  lng: number;
  managerName: string;
  managerPhone: string;
}

const seedStores: StoreSeed[] = [
  {
    number: '424',
    name: 'Amerin Balakong',
    format: 'DT',
    district: 'CHERAS',
    address: 'Amerin Balakong, Jalan Balakong, Cheras, Selangor',
    lat: 3.0445,
    lng: 101.7805,
    managerName: 'Store Manager',
    managerPhone: '01X-XXX XXXX',
  },
  {
    number: '385',
    name: 'Pearl Point',
    format: 'DT',
    district: 'KL',
    address: 'Pearl Point Shopping Mall, Jalan Sepadu, Bangsar South, KL',
    lat: 3.1024,
    lng: 101.6651,
    managerName: 'Store Manager',
    managerPhone: '01X-XXX XXXX',
  },
  {
    number: '169',
    name: 'Mid Valley',
    format: 'MALL',
    district: 'KL',
    address: 'Mid Valley Megamall, Lingkaran Syed Putra, KL',
    lat: 3.1179,
    lng: 101.6766,
    managerName: 'Azman',
    managerPhone: '012-0000001',
  },
  {
    number: '265',
    name: '1 Utama',
    format: 'MALL',
    district: 'PJ',
    address: '1 Utama Shopping Centre, Bandar Utama, PJ',
    lat: 3.1496,
    lng: 101.6156,
    managerName: 'Siti',
    managerPhone: '012-0000002',
  },
  {
    number: '300',
    name: 'Sunway Pyramid',
    format: 'MALL',
    district: 'SUNWAY',
    address: 'Sunway Pyramid Mall, Bandar Sunway',
    lat: 3.0732,
    lng: 101.6067,
    managerName: 'Hakim',
    managerPhone: '012-0000003',
  },
  {
    number: '410',
    name: 'Setia Alam',
    format: 'DT',
    district: 'SHA_ALAM',
    address: 'Persiaran Setia Alam, Shah Alam',
    lat: 3.0832,
    lng: 101.4624,
    managerName: 'Nadia',
    managerPhone: '012-0000004',
  },
  {
    number: '355',
    name: 'Klang Parade',
    format: 'MALL',
    district: 'KLANG',
    address: 'Klang Parade, Jalan Meru, Klang',
    lat: 3.0664,
    lng: 101.4514,
    managerName: 'Rashid',
    managerPhone: '012-0000005',
  },
  {
    number: '201',
    name: 'Ampang Point',
    format: 'MALL',
    district: 'AMPANG',
    address: 'Ampang Point Shopping Centre, Ampang',
    lat: 3.1625,
    lng: 101.7561,
    managerName: 'Mei Ling',
    managerPhone: '012-0000006',
  },
];

const toStore = (seed: StoreSeed): Store => {
  const storeNumber = seed.number.padStart(3, '0');
  return {
    id: storeNumber,
    number: storeNumber,
    name: seed.name,
    format: seed.format,
    district: seed.district,
    address: seed.address ?? `${seed.name}, Klang Valley, Malaysia`,
    coordinates: { lat: seed.lat, lng: seed.lng },
    manager: {
      name: seed.managerName,
      role: 'Store Manager',
      phone: seed.managerPhone,
    },
    devices: [
      {
        typeId: 'TC',
        index: 1,
        location: 'Front Counter POS 1',
        assetTag: `MY-KV-${storeNumber}-TC-01`,
      },
      {
        typeId: 'TC',
        index: 2,
        location: 'Front Counter POS 2',
        assetTag: `MY-KV-${storeNumber}-TC-02`,
      },
      {
        typeId: 'COD',
        index: 1,
        location: 'Front Counter (Customer Facing)',
        assetTag: `MY-KV-${storeNumber}-COD-01`,
      },
      {
        typeId: 'KVS_PRESENTER',
        index: 1,
        location: 'Expo / Counter Presenter',
        assetTag: `MY-KV-${storeNumber}-KVS-PRES-01`,
      },
      {
        typeId: 'KVS',
        index: 1,
        location: 'Kitchen - Grill Station',
        assetTag: `MY-KV-${storeNumber}-KVS-GRILL-01`,
      },
      {
        typeId: 'DELPHI',
        index: 1,
        location: 'Back Office / Comms Cabinet',
        assetTag: `MY-KV-${storeNumber}-DELPHI-01`,
      },
      {
        typeId: 'SWITCH',
        index: 1,
        location: 'Back Office / Comms Cabinet',
        assetTag: `MY-KV-${storeNumber}-SW-01`,
      },
    ],
    lastAuditDate: '2026-07-01',
    auditBy: 'Juden',
    notes: 'Sample device inventory. Update after first site visit.',
  };
};

export const stores: Store[] = seedStores.map(toStore);

export const districts: District[] = [
  'KL',
  'PJ',
  'SB',
  'CHERAS',
  'AMPANG',
  'PETALING',
  'KLANG',
  'SHA_ALAM',
  'SUBANG',
  'SUNWAY',
  'BUKIT_JALIL',
  'OTHER',
];

export const districtLabels: Record<District, string> = {
  KL: 'Kuala Lumpur',
  PJ: 'Petaling Jaya',
  SB: 'Subang / USJ',
  CHERAS: 'Cheras',
  AMPANG: 'Ampang',
  PETALING: 'Petaling',
  KLANG: 'Klang',
  SHA_ALAM: 'Shah Alam',
  SUBANG: 'Subang',
  SUNWAY: 'Sunway',
  BUKIT_JALIL: 'Bukit Jalil',
  OTHER: 'Other',
};

export const formatLabels: Record<StoreFormat, string> = {
  DT: 'Drive-Thru',
  MALL: 'Shopping Mall',
  STANDALONE: 'Standalone',
  FOOD_COURT: 'Food Court',
  OTHER: 'Other',
};

export function getStoreById(id: string): Store | undefined {
  return stores.find((s) => s.id === id || s.number === id || `#${s.number}` === id);
}

export function searchStores(query: string): Store[] {
  const q = query.trim().toLowerCase();
  if (!q) return stores;
  return stores.filter(
    (s) =>
      s.number.includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.district.toLowerCase().includes(q) ||
      s.address.toLowerCase().includes(q)
  );
}

export function storesByDistrict(district: District): Store[] {
  return stores.filter((s) => s.district === district);
}

export const totalStores = stores.length;
