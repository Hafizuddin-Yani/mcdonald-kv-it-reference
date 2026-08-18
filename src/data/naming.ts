import type { NamingConvention } from '../types';

/**
 * Naming convention guide for McDonald's Malaysia (Klang Valley).
 *
 * This documents how stores and devices are identified on tickets,
 * labels, and in the network. Update as you discover variations.
 */
export const namingConventions: NamingConvention[] = [
  {
    pattern: '[#] ### <Store Name> [DT|MALL|STANDALONE]',
    components: [
      {
        key: '#',
        label: 'Store Number',
        description: 'The unique 3-digit (or 4-digit) store identifier used across all systems and tickets.',
        format: '### (e.g. #424)',
        examples: ['#424', '#385'],
        required: true,
      },
      {
        key: 'Name',
        label: 'Store Name',
        description: 'Location-based name used on tickets and signage.',
        format: 'Text',
        examples: ['Amerin Balakong', 'Pearl Point'],
        required: true,
      },
      {
        key: 'Format',
        label: 'Store Format',
        description: 'Physical format of the store. DT = Drive-Thru.',
        format: 'DT | MALL | STANDALONE | FC',
        examples: ['DT', 'MALL', 'STANDALONE'],
        required: false,
      },
    ],
    examples: [
      '#424 Amerin Balakong DT',
      '#385 Pearl Point DT',
      '#169 Mid Valley Mall',
    ],
    rules: [
      'Store number always starts with #',
      'Store name is the signage/location name',
      'Format suffix (DT) appears on tickets when store has drive-thru',
      'Use the full "Store: #NNN Name" line from the ticket as canonical',
    ],
  },
  {
    pattern: '<DEVICE-SHORT-NAME> <INDEX or LOCATION>',
    components: [
      {
        key: 'DEVICE-SHORT-NAME',
        label: 'Device Short Name',
        description: 'Abbreviation used on tickets. See the device catalog for full mappings.',
        format: 'TC, KVS, COD, KOP, DT, etc.',
        examples: ['TC', 'KVS', 'COD', 'KVS Presenter'],
        required: true,
      },
      {
        key: 'INDEX',
        label: 'Index / Station',
        description: 'Number or location that identifies which unit of that device (e.g. COD 2 = second COD).',
        format: 'NN or <Station Name>',
        examples: ['COD 2', 'TC1', 'KVS Presenter'],
        required: false,
      },
    ],
    examples: ['COD 2', 'TC1', 'KVS Counter Presenter', 'DT-Headset1'],
    rules: [
      'Short names are used on tickets: KVS, COD, TC, DT, KOP, etc.',
      'Index numbers disambiguate multiple units of the same device',
      'KVS Presenter refers to the counter/expo KVS specifically',
      'Prefix DT- means drive-thru',
    ],
  },
  {
    pattern: 'MY-<REGION>-<STORE#>[-<DEVICE>-<INDEX>]',
    components: [
      {
        key: 'MY',
        label: 'Country',
        description: 'Country code prefix.',
        format: 'MY',
        examples: ['MY'],
        required: true,
      },
      {
        key: 'REGION',
        label: 'Region/District',
        description: 'Region or district code.',
        format: 'KV | KL | PJ | SB | etc.',
        examples: ['KV', 'KL', 'PJ'],
        required: true,
      },
      {
        key: 'STORE#',
        label: 'Store Number',
        description: '3-4 digit store number.',
        format: '###',
        examples: ['424', '385'],
        required: true,
      },
      {
        key: 'DEVICE',
        label: 'Device Code',
        description: 'Standard device code (optional for full asset tag).',
        format: 'COD, KVS, TC, DT, etc.',
        examples: ['COD', 'KVS', 'TC'],
        required: false,
      },
      {
        key: 'INDEX',
        label: 'Device Index',
        description: 'Which unit of that device (optional).',
        format: '01, 02, etc.',
        examples: ['01', '02'],
        required: false,
      },
    ],
    examples: ['MY-KV-424-COD-02', 'MY-KV-424-KVS-PRES-01', 'MY-KL-385-TC-01'],
    rules: [
      'This is the canonical asset tag format to follow when labeling',
      'Not every device has a full asset tag - many rely on short names only',
      'Check existing store labels before assuming the format',
    ],
  },
  {
    pattern: '<LAN PORT / PATCH PANEL>: PP<CAB#>-<PORT>',
    components: [
      {
        key: 'PP',
        label: 'Patch Panel',
        description: 'Patch panel identifier in the comms cabinet.',
        format: 'PP<Cabinet#>',
        examples: ['PP1', 'PP2'],
        required: true,
      },
      {
        key: 'PORT',
        label: 'Port Number',
        description: 'Port on that patch panel. Helps find exact cable run for a device.',
        format: 'NN',
        examples: ['01', '12', '24'],
        required: true,
      },
    ],
    examples: ['PP1-07', 'PP2-15'],
    rules: [
      'Comms cabinet is usually in the back office / DB room',
      'Match patch panel port to switch port to trace a device',
      'Label patch cables with the device name when possible',
    ],
  },
];

/** Quick decoder for common ticket device mentions. */
export const deviceMentions: Record<string, string> = {
  TC: 'Terminal (POS thin client)',
  'TC1': 'Terminal 1 (POS #1)',
  'TC2': 'Terminal 2 (POS #2)',
  'TC3': 'Terminal 3 (POS #3)',
  'TC4': 'Terminal 4 (POS #4)',
  KVS: 'Kitchen Video System (kitchen order display)',
  'KVS Presenter': 'Kitchen Video System at the counter/expo',
  'KVS Counter Presenter': 'Kitchen Video System at the counter/expo',
  COD: 'Customer Order Display (customer-facing order screen)',
  'COD 1': 'Customer Order Display #1',
  'COD 2': 'Customer Order Display #2',
  'Delphi modem': 'Delphi WAN modem/router in the comms cabinet',
  Delphi: 'Delphi WAN modem/router',
  Switch: 'Network switch in the comms cabinet',
  AP: 'Wireless access point',
  Kiosk: 'Self-order kiosk',
  'Bump Bar': 'Kitchen bump bar',
  KOP: 'Kitchen order printer',
  'DT Headset': 'Drive-thru headset',
  'DT Order Taker': 'Drive-thru order-taking station',
  'DT Timer': 'Drive-thru timer',
  CRT: 'Cash drawer/till',
  RCPT: 'Receipt printer',
};
