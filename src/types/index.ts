export type StoreFormat = 'DT' | 'Mall' | 'Standalone' | 'Airport' | 'Express';
export type DeviceCategory = 'POS' | 'Kitchen' | 'Customer-facing' | 'Drive-thru' | 'Network';

export interface Store {
  id: string;              // "424"
  name: string;            // "Amerin Balakong"
  format: StoreFormat;
  district: string;        // "Cheras"
  address: string;
  coordinates: { lat: number; lng: number };
  manager?: { name: string; phone: string };
  devices: StoreDevice[];
  networkTopologyPhoto?: string;
  layoutPhotos?: Record<string, string>;
  lastVerified?: string;   // ISO date
}

export interface Device {
  shortName: string;       // "COD"
  fullName: string;        // "Customer Order Display"
  category: DeviceCategory;
  typicalLocations: string[];
  description: string;
  specs?: Record<string, string>;
  commonIssues?: TroubleshootingEntry[];
  photos?: string[];
  namingPattern: string;   // "COD-[LOCATION]-[INDEX]"
  icon: string;            // lucide icon name
}

export interface StoreDevice {
  type: string;            // references Device.shortName
  index?: number;
  location: string;
  assetTag: string;        // "MY-KV-424-COD-02"
  photo?: string;
  notes?: string;
  status?: 'active' | 'faulty' | 'replaced';
}

export interface TroubleshootingEntry {
  id: string;
  deviceType: string;
  title: string;
  symptom: string;
  possibleCause: string;
  resolution: string;
  escalation?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface NamingConvention {
  segment: string;
  description: string;
  examples: string[];
  pattern: string;
}

export interface OnboardingStep {
  week: number;
  title: string;
  tasks: string[];
  resources?: string[];
}
