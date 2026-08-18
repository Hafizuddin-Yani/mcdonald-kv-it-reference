/**
 * Core type definitions for McDonald's MY Klang Valley IT Device Reference
 */

export type DeviceCategory = 
  | 'POS' 
  | 'KDS' 
  | 'COD' 
  | 'KVS' 
  | 'DRIVE_THRU' 
  | 'NETWORK' 
  | 'KIOSK' 
  | 'PERIPHERAL' 
  | 'OTHER';

export type StoreFormat = 'DT' | 'MALL' | 'STANDALONE' | 'FOOD_COURT' | 'OTHER';

export type District = 
  | 'KL' 
  | 'PJ' 
  | 'SB' 
  | 'CHERAS' 
  | 'AMPANG' 
  | 'PETALING' 
  | 'KLANG' 
  | 'SHA_ALAM' 
  | 'SUBANG' 
  | 'SUNWAY' 
  | 'BUKIT_JALIL' 
  | 'OTHER';

export interface DeviceType {
  id: string;
  shortName: string;
  fullName: string;
  category: DeviceCategory;
  description: string;
  typicalLocations: string[];
  namingPattern: string;
  examples: string[];
  /** Precise "how to find it in the store" hint shown to new engineers. */
  locationHint?: string;
  /** Other devices this one connects to / depends on, with the relation. */
  relatedDevices?: { typeId: string; relation: string }[];
  /** Extra search terms (e.g. "cod 2", "delphi modem") for ticket matching. */
  searchKeywords?: string[];
  specs?: DeviceSpecs;
  commonIssues?: CommonIssue[];
  photos?: string[];
}

export interface DeviceSpecs {
  model?: string;
  manufacturer?: string;
  os?: string;
  processor?: string;
  memory?: string;
  storage?: string;
  display?: string;
  ports?: string[];
  power?: string;
  dimensions?: string;
  weight?: string;
}

export interface CommonIssue {
  id: string;
  title: string;
  symptoms: string[];
  workaround: string[];
  resolution: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  frequency: 'RARE' | 'OCCASIONAL' | 'COMMON' | 'VERY_COMMON';
}

export interface StoreDevice {
  typeId: string;
  index: number;
  location: string;
  assetTag: string;
  serialNumber?: string;
  model?: string;
  installDate?: string;
  lastVerified?: string;
  notes?: string;
  photo?: string;
}

export interface StoreContact {
  name: string;
  role: string;
  phone: string;
  email?: string;
}

export interface Store {
  id: string;
  number: string;
  name: string;
  format: StoreFormat;
  district: District;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  manager: StoreContact;
  itContact?: StoreContact;
  devices: StoreDevice[];
  networkTopologyPhoto?: string;
  layoutPhotos?: {
    counter?: string;
    kitchen?: string;
    backoffice?: string;
    driveThru?: string;
    dining?: string;
  };
  openingHours?: string;
  lastAuditDate?: string;
  auditBy?: string;
  notes?: string;
}

export interface Ticket {
  id: string;
  storeNumber: string;
  deviceShortName: string;
  issue: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  resolvedAt?: string;
  slaDeadline?: string;
  reporter: {
    name: string;
    phone: string;
  };
  workaround?: string;
  resolution?: string;
  assignedTo?: string;
}

/** Result of parsing a raw pasted ticket email. */
export interface ParsedTicket {
  ticketNumber: string;
  storeNumber: string;
  storeName: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  issue: string;
  reporterName: string;
  reporterPhone: string;
  workaround: string;
  /** SLA TTR deadline read from the email ("end on DD-MM-YYYY HH:mm", MY time). */
  slaDeadline?: string;
  raw: string;
}

/** A ticket saved locally in the browser for reference (keeps raw email). */
export interface SavedTicket extends Ticket {
  /** Store name captured at save time (may not be in the store directory yet). */
  storeName?: string;
  /** Raw email text, kept only in the browser - never exported. */
  raw?: string;
  /** ISO timestamp when it was saved locally. */
  savedAt: string;
}

/** A device detected inside a pasted ticket. */
export interface DetectedDevice {
  deviceTypeId: string;
  shortName: string;
  fullName: string;
  index?: number;
  /** The matched text from the ticket (e.g. "COD 2"). */
  matched: string;
  /** Where it was found (issue line / workaround). */
  source: string;
}

/** A likely problem type matched from the ticket text. */
export interface MatchedProblem {
  issueId: string;
  title: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  symptoms: string[];
  workaround: string[];
  resolution: string;
  confidence: 'high' | 'medium';
}

export interface NamingConvention {
  pattern: string;
  components: NamingComponent[];
  examples: string[];
  rules: string[];
}

export interface NamingComponent {
  key: string;
  label: string;
  description: string;
  format: string;
  examples: string[];
  required: boolean;
}

export interface SearchResult {
  type: 'store' | 'device' | 'ticket' | 'naming' | 'page';
  id: string;
  title: string;
  subtitle: string;
  description?: string;
  url: string;
  score: number;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  offlineEnabled: boolean;
  defaultDistrict?: District;
  bookmarkedStores: string[];
  bookmarkedDevices: string[];
}

export interface AppConfig {
  version: string;
  lastDataUpdate: string;
  totalStores: number;
  totalDevices: number;
  districts: District[];
  deviceCategories: DeviceCategory[];
  storeFormats: StoreFormat[];
}