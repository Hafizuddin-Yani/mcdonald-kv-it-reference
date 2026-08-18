import type { AppConfig } from '../types';
import { stores, districts } from './stores';
import { deviceTypes } from './deviceTypes';

export const appConfig: AppConfig = {
  version: '0.2.0',
  lastDataUpdate: '2026-08-01',
  totalStores: stores.length,
  totalDevices: stores.reduce((acc, s) => acc + s.devices.length, 0),
  districts,
  deviceCategories: [
    'POS',
    'KDS',
    'COD',
    'KVS',
    'DRIVE_THRU',
    'NETWORK',
    'KIOSK',
    'PERIPHERAL',
    'OTHER',
  ],
  storeFormats: ['DT', 'MALL', 'STANDALONE', 'FOOD_COURT', 'OTHER'],
};

export const totalDeviceTypes = deviceTypes.length;
