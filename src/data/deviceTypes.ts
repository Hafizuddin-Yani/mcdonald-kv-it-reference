import type { DeviceType } from '../types';
import tcImg from '../assets/devices/tc.svg';
import eftImg from '../assets/devices/eft.svg';
import kvsImg from '../assets/devices/kvs.svg';
import kvsPresenterImg from '../assets/devices/kvs_presenter.svg';
import bumpBarImg from '../assets/devices/bump_bar.svg';
import kitchenPrinterImg from '../assets/devices/kitchen_printer.svg';
import labelPrinterImg from '../assets/devices/label_printer.svg';
import codImg from '../assets/devices/cod.svg';
import dtHeadsetImg from '../assets/devices/dt_headset.svg';
import dtBaseImg from '../assets/devices/dt_base.svg';
import dtOrderTakerImg from '../assets/devices/dt_order_taker.svg';
import dtTimerImg from '../assets/devices/dt_timer.svg';
import dtConfirmImg from '../assets/devices/dt_confirm.svg';
import switchImg from '../assets/devices/switch.svg';
import delphiImg from '../assets/devices/delphi.svg';
import routerImg from '../assets/devices/router.svg';
import apImg from '../assets/devices/ap.svg';
import patchPanelImg from '../assets/devices/patch_panel.svg';
import upsImg from '../assets/devices/ups.svg';
import kioskImg from '../assets/devices/kiosk.svg';
import mccImg from '../assets/devices/mcc.svg';
import crtImg from '../assets/devices/crt.svg';
import rcptImg from '../assets/devices/rcpt.svg';
import printerSrvImg from '../assets/devices/printer_srv.svg';

/**
 * Device taxonomy for McDonald's Malaysia Klang Valley stores.
 *
 * Short names are what appear on tickets and device labels.
 * Full names are the official/verbose names used internally.
 *
 * `locationHint` tells a new engineer exactly where to look.
 * `searchKeywords` are terms used on tickets (e.g. "cod 2", "delphi modem").
 * `relatedDevices` explain how devices connect so you can trace an issue.
 *
 * NOTE: This is a living document. Add new devices as you encounter them
 * on tickets or during site visits. Verify specs with senior engineers.
 */
export const deviceTypes: DeviceType[] = [
  // ═══════════════════════════════════════════════════════════════════
  // POS (Point of Sale) - Front of house transaction terminals
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'TC',
    photos: [tcImg],
    shortName: 'TC',
    fullName: 'Terminal / Thin Client (POS)',
    category: 'POS',
    description:
      'The main POS thin client used at the counter and drive-thru to take orders, process payments and manage cash. Runs the NewPOS / StorePOS application.',
    typicalLocations: [
      'Front counter POS 1-4',
      'Drive-thru POS',
      'Mobile order fulfilment point',
    ],
    namingPattern: 'TC<NN> (e.g. TC1, TC2) or TC-<POS#>-<Station>',
    examples: ['TC1', 'TC2', 'DT-TC1', 'POS-TC3'],
    locationHint:
      'At each order station. TC1 is usually the first counter POS on the left (facing the counter). Drive-thru has its own TC near the window.',
    searchKeywords: ['tc1', 'tc2', 'tc3', 'tc4', 'pos', 'terminal', 'pos offline'],
    relatedDevices: [
      { typeId: 'COD', relation: 'Feeds the customer order display' },
      { typeId: 'RCPT', relation: 'Connects to receipt printer' },
      { typeId: 'CRT', relation: 'Opens cash drawer' },
      { typeId: 'EFT', relation: 'Connected to payment terminal' },
      { typeId: 'SWITCH', relation: 'LAN uplink via comms cabinet' },
    ],
    specs: {
      model: 'Varies by site (e.g. Panasonic Toughbook, HP Thin Client)',
      manufacturer: 'Varies',
      os: 'Windows 10 IoT / ThinOS',
      ports: ['Ethernet (LAN)', 'USB', 'Display (DP/VGA)', 'Serial (COM)'],
      power: '12V DC adapter',
    },
    commonIssues: [
      {
        id: 'TC-OFFLINE',
        title: 'TC Offline / Network Down',
        symptoms: ['"Offline" or "Cannot connect to server"', 'Slows at checkout', 'Orders not saved'],
        workaround: [
          'Restart the TC',
          'Reseat LAN cable at back of TC',
          'Reseat LAN cable at switch port (comms cabinet / back office)',
          'Check switch LED and network patch',
          'Ping the server / host IP',
        ],
        resolution:
          'If reseat/restart fails, trace cable back to switch, check port status, replace patch cable, escalate if switch port dead.',
        priority: 'HIGH',
        frequency: 'VERY_COMMON',
      },
      {
        id: 'TC-BLANK',
        title: 'TC Blank Screen / No Display',
        symptoms: ['White/black screen', 'No boot (beep codes)', 'Screen stays on logo'],
        workaround: [
          'Check power LED',
          'Restart TC',
          'Reseat display cable',
        ],
        resolution:
          'If no boot after restart, check PSU and try known-good display cable. Escalate for onsite if hardware fault.',
        priority: 'NORMAL',
        frequency: 'COMMON',
      },
    ],
  },
  {
    id: 'EFT',
    photos: [eftImg],
    shortName: 'EFT / Paytron',
    fullName: 'EFT / Paytron Payment Terminal',
    category: 'POS',
    description:
      'Card payment terminal at each POS for debit/credit/e-wallet payments. Often branded Paytron (or similar). Processes chip, PIN and contactless.',
    typicalLocations: ['Front counter POS (next to each TC)', 'Drive-thru POS', 'Kiosk (built-in payment module)'],
    namingPattern: 'EFT<NN> or Paytron-<POS#>',
    examples: ['EFT1', 'EFT2', 'Paytron-TC1'],
    locationHint:
      'Sits on the counter next to each POS terminal. Usually a standalone card reader with PIN pad; at kiosks it is built into the machine.',
    searchKeywords: ['eft', 'paytron', 'payment', 'card', 'card reader', 'terminal'],
    relatedDevices: [
      { typeId: 'TC', relation: 'Connected to the POS terminal' },
      { typeId: 'SWITCH', relation: 'Network uplink' },
    ],
    specs: {
      model: 'Varies (e.g. Paytron, PAX, Ingenico)',
      ports: ['Ethernet (LAN)', 'USB', 'PSTN fallback'],
      power: 'AC adapter / PoE',
    },
    commonIssues: [
      {
        id: 'EFT-NOT-WORKING',
        title: 'EFT Terminal Not Working',
        symptoms: ['Card declined / error', '"Cannot connect" on payment', 'Terminal offline', 'PIN pad unresponsive'],
        workaround: [
          'Check terminal display for error codes',
          'Restart the payment terminal',
          'Reseat LAN cable',
          'Reboot Delphi modem if multiple payments fail',
        ],
        resolution:
          'Restart terminal, check LAN. If multiple terminals down, the payment gateway/network (Delphi) is likely the cause.',
        priority: 'HIGH',
        frequency: 'OCCASIONAL',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // KDS / KVS - Kitchen display systems
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'KVS',
    photos: [kvsImg],
    shortName: 'KVS',
    fullName: 'Kitchen Video System (Display)',
    category: 'KDS',
    description:
      'Kitchen display screens that show order items for food preparation. Located at each kitchen station (Grill, Fry, Assembly/Expo, Drinks, Dessert).',
    typicalLocations: [
      'Grill station',
      'Fry station',
      'Assembly / Expo station',
      'Drinks / Beverage station',
      'Dessert station',
    ],
    namingPattern: 'KVS-<Station> or KVS<NN>',
    examples: ['KVS-EXPO', 'KVS-GRILL', 'KVS-FRY', 'KVS1'],
    locationHint:
      'Wall/stand-mounted screens inside the kitchen, one per station. Look for the station labels (GRILL, FRY, EXPO). Each is a separate KVS terminal with its own LAN cable.',
    searchKeywords: ['kvs', 'kvs expo', 'kvs grill', 'kvs fry', 'kitchen display', 'kds', '0/0'],
    relatedDevices: [
      { typeId: 'SWITCH', relation: 'LAN uplink via kitchen cabling' },
      { typeId: 'BUMP_BAR', relation: 'Bump bar mounts to KVS' },
    ],
    specs: {
      model: 'Varies (e.g. ELO, HP, dedicated KVS panels)',
      manufacturer: 'Varies',
      os: 'Windows / Embedded',
      display: 'Counter/kitchen LCD panel',
    },
    commonIssues: [
      {
        id: 'KVS-OFFLINE',
        title: 'KVS Offline / Not Showing Orders',
        symptoms: ['Orders not appearing', 'Shows 0/0 (offline)', 'Blank screen', 'Freezes on old order'],
        workaround: [
          'Restart the KVS terminal (TC/panel)',
          'Reseat LAN cable',
          'Reseat LAN cable at switch',
          'Check KVS app/service running',
        ],
        resolution:
          'If offline persists after restart+reseat, check network port and KVS server connectivity. Onsite visit may be required to inspect cabling in kitchen ceiling/wall.',
        priority: 'HIGH',
        frequency: 'VERY_COMMON',
      },
    ],
  },
  {
    id: 'KVS_PRESENTER',
    photos: [kvsPresenterImg],
    shortName: 'KVS Presenter',
    fullName: 'KVS Counter Presenter',
    category: 'KDS',
    description:
      'A KVS screen at the counter (expo) that shows orders for handoff to the customer, including order numbers for the presenter/runner to call out.',
    typicalLocations: ['Counter / Expo handoff area'],
    namingPattern: 'KVS-PRESENTER or KVS-PRES',
    examples: ['KVS-PRESENTER', 'KVS-PRES'],
    locationHint:
      'The screen facing the kitchen side of the counter/handoff area, often near the expo bump bar. It is the FIRST KVS you see from the front counter.',
    searchKeywords: ['kvs presenter', 'kvs counter', 'presenter', '0/0', 'counter presenter'],
    relatedDevices: [
      { typeId: 'KVS', relation: 'Counter version of kitchen KVS' },
      { typeId: 'SWITCH', relation: 'LAN uplink' },
    ],
    commonIssues: [
      {
        id: 'KVSP-OFFLINE',
        title: 'KVS Presenter Offline',
        symptoms: ['Counter presenter shows 0/0 (offline)', 'No order numbers on screen'],
        workaround: [
          'Restart presenter terminal',
          'Reseat LAN cable',
          'Reseat LAN cable at switch port',
          'Request onsite visit if persists',
        ],
        resolution:
          'Verify LAN run to presenter, check switch port, restart KVS app. Onsite if cabling/port fault suspected.',
        priority: 'NORMAL',
        frequency: 'VERY_COMMON',
      },
    ],
  },
  {
    id: 'BUMP_BAR',
    photos: [bumpBarImg],
    shortName: 'Bump Bar',
    fullName: 'Kitchen Bump Bar',
    category: 'KDS',
    description:
      'A push-button device attached to a kitchen display (usually Expo/Grill) used by crew to acknowledge/bump completed orders.',
    typicalLocations: ['Expo / Grill station, mounted to KVS'],
    namingPattern: 'Bump Bar <Station>',
    examples: ['Bump Bar Expo', 'Bump Bar Grill'],
    locationHint:
      'A small bar with buttons, mounted below or beside the KVS screen at the Expo/Grill station.',
    searchKeywords: ['bump bar', 'bump', 'bump bar expo', 'bump bar grill'],
    relatedDevices: [{ typeId: 'KVS', relation: 'Mounts to and feeds the KVS screen' }],
    commonIssues: [
      {
        id: 'BUMP-NOT-WORKING',
        title: 'Bump Bar Not Registering',
        symptoms: ['Presses do not bump orders', 'Crew must use touchscreen instead'],
        workaround: ['Replug USB/PS2 cable', 'Restart KVS terminal', 'Check connections'],
        resolution: 'If replug fails, replace bump bar (common failure).',
        priority: 'LOW',
        frequency: 'OCCASIONAL',
      },
    ],
  },
  {
    id: 'KITCHEN_PRINTER',
    photos: [kitchenPrinterImg],
    shortName: 'Kitchen Printer',
    fullName: 'Kitchen Order Printer (KOP)',
    category: 'KDS',
    description:
      'Thermal printer in kitchen for paper order tickets (used where KVS not deployed or as backup).',
    typicalLocations: ['Kitchen station', 'Expo'],
    namingPattern: 'KOP-<Station>',
    examples: ['KOP-GRILL', 'KOP-EXPO'],
    locationHint:
      'Mounted at the kitchen station, usually above or beside the KVS. Follow the label "KOP-<Station>".',
    searchKeywords: ['kop', 'kitchen printer', 'kitchen order printer'],
    relatedDevices: [
      { typeId: 'SWITCH', relation: 'Network print jobs' },
      { typeId: 'KVS', relation: 'Backup to KVS' },
    ],
    commonIssues: [
      {
        id: 'KPRINT-JAM',
        title: 'Kitchen Printer Paper Jam / No Paper',
        symptoms: ['Paper stuck', '"Out of paper" error', 'Smudged prints'],
        workaround: ['Clear jam', 'Replace paper roll', 'Clean print head'],
        resolution: 'Replace paper, clear jam, clean head. Replace printer if recurring.',
        priority: 'LOW',
        frequency: 'OCCASIONAL',
      },
    ],
  },
  {
    id: 'LABEL_PRINTER',
    photos: [labelPrinterImg],
    shortName: 'Label Printer',
    fullName: 'Label / Ticket Printer',
    category: 'KDS',
    description:
      'Printer that prints product/pack labels (e.g. McDelivery, McCafe, packed items) used at the assembly/packing area.',
    typicalLocations: ['Packing / assembly area', 'McDelivery fulfilment area', 'McCafe'],
    namingPattern: 'LABEL<NN>',
    examples: ['LABEL1', 'LABEL2'],
    locationHint:
      'Usually on the packing table near the expo/assembly station where deliveries and takeaway bags are made.',
    searchKeywords: ['label', 'label printer', 'sticker'],
    relatedDevices: [
      { typeId: 'SWITCH', relation: 'Network print jobs' },
    ],
    commonIssues: [
      {
        id: 'LABEL-JAM',
        title: 'Label Printer Issues',
        symptoms: ['No labels print', 'Labels crooked/blank', 'Paper/label jam'],
        workaround: ['Replace label roll', 'Clear jam', 'Restart printer / reinstall driver'],
        resolution: 'Clear jam, replace roll, verify queue. Escalate if recurring hardware fault.',
        priority: 'NORMAL',
        frequency: 'OCCASIONAL',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // COD - Customer-facing order displays
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'COD',
    photos: [codImg],
    shortName: 'COD',
    fullName: 'Customer Order Display',
    category: 'COD',
    description:
      'Screen shown to the customer confirming their order number, total and preparation status. Used at counter and drive-thru.',
    typicalLocations: [
      'Front counter (facing customer)',
      'Drive-thru (order confirmation panel)',
    ],
    namingPattern: 'COD<NN> (e.g. COD1, COD2) or COD-<Location>',
    examples: ['COD1', 'COD2', 'DT-COD'],
    locationHint:
      'The customer-facing screen mounted high at the front counter. COD 2 is the SECOND screen along the counter (right side). At drive-thru it faces the customer in the lane.',
    searchKeywords: ['cod', 'cod 1', 'cod 2', 'cod1', 'cod2', 'order display', 'customer display', 'blank'],
    relatedDevices: [
      { typeId: 'TC', relation: 'Fed by the POS terminal' },
      { typeId: 'SWITCH', relation: 'LAN uplink' },
      { typeId: 'DELPHI', relation: 'Network comes via Delphi' },
    ],
    commonIssues: [
      {
        id: 'COD-BLANK',
        title: 'COD Blank / White Screen',
        symptoms: ['White screen', 'Black screen', 'No order info displayed'],
        workaround: [
          'Restart the COD device',
          'Reseat display/LAN cables',
          'Reseat Delphi modem',
          'Reboot modem',
        ],
        resolution:
          'If remote access works but screen blank, it is usually the panel/display. Reseat cabling, reboot device and modem. Onsite if persists.',
        priority: 'NORMAL',
        frequency: 'VERY_COMMON',
      },
      {
        id: 'COD-FROZEN',
        title: 'COD Frozen / Wrong Order',
        symptoms: ['Stuck on old order', 'Shows wrong order number'],
        workaround: ['Restart COD', 'Check queue in POS'],
        resolution: 'Restart device; verify server connection. Escalate if repeat.',
        priority: 'NORMAL',
        frequency: 'OCCASIONAL',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // Drive-thru
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'DT_HEADSET',
    photos: [dtHeadsetImg],
    shortName: 'DT Headset',
    fullName: 'Drive-Thru Headset',
    category: 'DRIVE_THRU',
    description:
      'Headsets worn by drive-thru crew to take orders. Connects to the DT base station via the intercom system.',
    typicalLocations: ['Drive-thru order point / counter', 'Order-taking station'],
    namingPattern: 'DT-HEADSET<NN> or Headset <Station>',
    examples: ['DT-Headset1', 'DT-Headset2'],
    locationHint:
      'Worn by crew or docked on chargers at the DT order-taking station inside. Each headset belongs to a charging/belt pack slot.',
    searchKeywords: ['dt headset', 'headset', 'dt audio', 'drive thru headset', 'belt pack'],
    relatedDevices: [{ typeId: 'DT_BASE', relation: 'Wireless link to base station' }],
    commonIssues: [
      {
        id: 'DTH-NO-SOUND',
        title: 'Headset No Sound / Static',
        symptoms: ['Crew cannot hear customer', 'Static/interference', 'Microphone not picking up'],
        workaround: [
          'Check headset mute switch',
          'Recharge/replace battery',
          'Re-seat headset to base',
          'Check belt pack',
        ],
        resolution: 'Replace battery, check base station channels, reseat belt pack. Escalate if base station fault.',
        priority: 'HIGH',
        frequency: 'OCCASIONAL',
      },
    ],
  },
  {
    id: 'DT_BASE',
    photos: [dtBaseImg],
    shortName: 'DT Base',
    fullName: 'Drive-Thru Base Station / Intercom Unit',
    category: 'DRIVE_THRU',
    description:
      'The central intercom/radio unit that links DT headsets, the order taker, and the outdoor speaker/menu board. The hub of the drive-thru audio system.',
    typicalLocations: ['Drive-thru order-taking station (inside)', 'Back office / comms area near DT'],
    namingPattern: 'DT-BASE or INTERCOM',
    examples: ['DT-BASE', 'INTERCOM'],
    locationHint:
      'Usually mounted near the DT order taker position. Follow the cables from the headsets\' chargers. It connects to the outdoor speaker and menu board.',
    searchKeywords: ['dt base', 'base station', 'intercom', 'dt audio'],
    relatedDevices: [
      { typeId: 'DT_HEADSET', relation: 'Wireless link to headsets' },
      { typeId: 'DT_CONFIRM', relation: 'Feeds order confirmation audio/display' },
      { typeId: 'SWITCH', relation: 'LAN uplink' },
    ],
    commonIssues: [
      {
        id: 'DTBASE-DOWN',
        title: 'DT Base Station Down / No Audio',
        symptoms: ['All headsets dead', 'No customer audio', 'Outdoor speaker silent'],
        workaround: [
          'Power cycle the base station',
          'Check antenna/connections',
          'Verify headset charging/belt packs',
        ],
        resolution:
          'Power cycle base unit. If all audio dead, likely base/intercom fault - escalate for onsite.',
        priority: 'HIGH',
        frequency: 'OCCASIONAL',
      },
    ],
  },
  {
    id: 'DT_ORDER_TAKER',
    photos: [dtOrderTakerImg],
    shortName: 'DT Order Taker',
    fullName: 'Drive-Thru Order Taker (Display/Station)',
    category: 'DRIVE_THRU',
    description:
      'The station/monitor at drive-thru where the order taker views orders and operates the DT POS.',
    typicalLocations: ['Drive-thru order point'],
    namingPattern: 'DT-OT<NN>',
    examples: ['DT-OT1'],
    locationHint:
      'The monitor at the DT window used with a headset. Often paired with the DT base station underneath.',
    searchKeywords: ['dt order taker', 'dt ot', 'order taker'],
    relatedDevices: [
      { typeId: 'DT_BASE', relation: 'Headset audio comes via base' },
      { typeId: 'SWITCH', relation: 'LAN uplink' },
    ],
    commonIssues: [
      {
        id: 'DTOT-FREEZE',
        title: 'DT Order Taker Frozen',
        symptoms: ['Screen freeze', 'Cannot take orders'],
        workaround: ['Restart station', 'Check LAN'],
        resolution: 'Restart, check network. Escalate if hardware.',
        priority: 'HIGH',
        frequency: 'COMMON',
      },
    ],
  },
  {
    id: 'DT_TIMER',
    photos: [dtTimerImg],
    shortName: 'DT Timer',
    fullName: 'Drive-Thru Timer (DSM)',
    category: 'DRIVE_THRU',
    description:
      'Digital sign/monitor showing order timers and drive-thru performance metrics, often with voice prompts.',
    typicalLocations: ['Drive-thru window', 'Inside DT lane visible to crew'],
    namingPattern: 'DT-TIMER',
    examples: ['DT-TIMER'],
    locationHint:
      'Mounted at the DT window, visible to crew and management. Shows order timing.',
    searchKeywords: ['dt timer', 'timer', 'dsm', 'drive thru timer'],
    relatedDevices: [{ typeId: 'SWITCH', relation: 'LAN uplink' }],
    commonIssues: [
      {
        id: 'DTT-BLANK',
        title: 'DT Timer Blank',
        symptoms: ['No display', 'No timer count'],
        workaround: ['Restart', 'Check power'],
        resolution: 'Restart device; check power supply.',
        priority: 'LOW',
        frequency: 'RARE',
      },
    ],
  },
  {
    id: 'DT_CONFIRM',
    photos: [dtConfirmImg],
    shortName: 'DT Confirmation',
    fullName: 'Drive-Thru Order Confirmation Screen',
    category: 'DRIVE_THRU',
    description:
      'Screen showing the customer their order as they wait in the drive-thru lane, confirming items and total before the payment window.',
    typicalLocations: ['Drive-thru lane (customer-facing, near order point)'],
    namingPattern: 'DT-CONFIRM or DT-COD',
    examples: ['DT-CONFIRM', 'DT-COD'],
    locationHint:
      'Faces the customer in the drive-thru lane, usually mounted on a pole near the order/menu board. It is the DT version of the COD.',
    searchKeywords: ['dt confirm', 'dt confirmation', 'confirmation screen', 'dt cod'],
    relatedDevices: [
      { typeId: 'DT_ORDER_TAKER', relation: 'Shows order taken at DT station' },
      { typeId: 'SWITCH', relation: 'LAN uplink' },
    ],
    commonIssues: [
      {
        id: 'DTC-BLANK',
        title: 'DT Confirmation Blank / No Order',
        symptoms: ['Blank screen in lane', 'Shows wrong/old order', 'No display'],
        workaround: ['Restart the confirmation unit', 'Reseat LAN/power cables', 'Reboot Delphi modem'],
        resolution:
          'Reseat cabling, restart. If remote OK but screen blank, panel fault - onsite visit likely needed (outdoor wiring).',
        priority: 'NORMAL',
        frequency: 'COMMON',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // Network / Infrastructure
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'SWITCH',
    photos: [switchImg],
    shortName: 'Switch',
    fullName: 'Network Switch',
    category: 'NETWORK',
    description:
      'The core network switch(es) in the comms cabinet / back office. All POS, KDS, COD, printers and APs connect here.',
    typicalLocations: ['Back office / Comms cabinet (DB/IDF room)'],
    namingPattern: 'SW-<CAB#>-<PORT> or by rack position',
    examples: ['SW-1', 'SW-RACK2'],
    locationHint:
      'In the comms cabinet in the back office. Find it by following LAN cables. Each device you troubleshoot terminates at a switch port - note the port number.',
    searchKeywords: ['switch', 'network switch', 'comms'],
    relatedDevices: [
      { typeId: 'DELPHI', relation: 'Uplink to WAN via Delphi/router' },
      { typeId: 'PATCH_PANEL', relation: 'Patched from patch panel ports' },
      { typeId: 'AP', relation: 'Powers WiFi APs (PoE)' },
    ],
    specs: {
      model: 'Varies (e.g. Cisco, HPE, Aruba)',
      ports: ['8-48 port PoE/Non-PoE', 'SFP uplink'],
      power: 'AC mains',
    },
    commonIssues: [
      {
        id: 'SW-PORT-DEAD',
        title: 'Switch Port Dead / No Link',
        symptoms: ['Device offline', 'Port LED off', 'Intermittent connectivity'],
        workaround: [
          'Reseat patch cable',
          'Try a different switch port',
          'Reboot switch',
        ],
        resolution: 'Move device to spare port, label it, log switch replacement.',
        priority: 'HIGH',
        frequency: 'OCCASIONAL',
      },
    ],
  },
  {
    id: 'DELPHI',
    photos: [delphiImg],
    shortName: 'Delphi',
    fullName: 'Delphi Network Modem/Router',
    category: 'NETWORK',
    description:
      'The WAN modem/router providing the store internet/network uplink to McDonald\'s corporate. Critical for POS, KVS, payments and remote support.',
    typicalLocations: ['Back office / Comms cabinet'],
    namingPattern: 'DELPHI or DELPHI-<Store#>',
    examples: ['Delphi', 'Delphi-0424'],
    locationHint:
      'In the comms cabinet, connected to the ISP line. Usually has indicator LEDs for WAN/LAN/4G. The single most important device in the store network.',
    searchKeywords: ['delphi', 'delphi modem', 'modem', 'router', 'wan', 'internet down'],
    relatedDevices: [
      { typeId: 'SWITCH', relation: 'Feeds the network switch' },
      { typeId: 'ROUTER', relation: 'Store router/firewall downstream' },
    ],
    commonIssues: [
      {
        id: 'DELPHI-DOWN',
        title: 'Delphi Modem Down / No WAN',
        symptoms: ['Store fully offline', 'POS cannot reach server', 'Payments fail'],
        workaround: [
          'Reboot Delphi modem',
          'Check power and LAN to modem',
          'Check SIM/WAN status if cellular fallback',
          'Reseat modem',
        ],
        resolution:
          'Reboot modem. If no recovery, check ISP line status and escalate to network team with store #.',
        priority: 'CRITICAL',
        frequency: 'OCCASIONAL',
      },
    ],
  },
  {
    id: 'ROUTER',
    photos: [routerImg],
    shortName: 'Router',
    fullName: 'Store Router / Firewall',
    category: 'NETWORK',
    description:
      'The store edge router/firewall separating the store LAN from the WAN. Works with the Delphi modem to route traffic for POS, back office and WiFi.',
    typicalLocations: ['Back office / Comms cabinet (beside Delphi)'],
    namingPattern: 'ROUTER or FW-<Store#>',
    examples: ['Router', 'FW-0424'],
    locationHint:
      'Beside the Delphi modem in the comms cabinet. LAN ports face the switch; WAN port faces Delphi/ISP.',
    searchKeywords: ['router', 'firewall', 'fw', 'gateway'],
    relatedDevices: [
      { typeId: 'DELPHI', relation: 'WAN side connects to Delphi' },
      { typeId: 'SWITCH', relation: 'LAN side feeds switch' },
    ],
    commonIssues: [
      {
        id: 'ROUTER-DOWN',
        title: 'Router/Firewall Down',
        symptoms: ['Segments offline', 'No internet', 'Some devices unreachable'],
        workaround: ['Reboot router', 'Check WAN/LAN link LEDs', 'Verify DHCP/VLAN config'],
        resolution:
          'Reboot. If persists, escalate to network team - do not attempt config changes without approval.',
        priority: 'HIGH',
        frequency: 'RARE',
      },
    ],
  },
  {
    id: 'AP',
    photos: [apImg],
    shortName: 'AP',
    fullName: 'Wireless Access Point',
    category: 'NETWORK',
    description:
      'WiFi access points covering dining, kitchen and back office for crew devices, kiosks, mobile and back-office equipment.',
    typicalLocations: ['Ceiling in dining area', 'Ceiling in kitchen', 'Back office'],
    namingPattern: 'AP-<Zone>-<NN>',
    examples: ['AP-DINING-1', 'AP-KITCHEN-1'],
    locationHint:
      'Mounted on the ceiling. Often powered by PoE from the switch - so "AP down" frequently means "check the PoE switch port".',
    searchKeywords: ['ap', 'wifi', 'access point', 'wireless'],
    relatedDevices: [
      { typeId: 'SWITCH', relation: 'Powered via PoE from switch' },
    ],
    commonIssues: [
      {
        id: 'AP-DOWN',
        title: 'AP Down / Weak Signal',
        symptoms: ['No WiFi in zone', 'Slow network', 'Kiosk/crew device offline'],
        workaround: ['Reboot AP (power cycle)', 'Check PoE switch port'],
        resolution: 'Power cycle, check PoE, verify channel. Replace if faulty.',
        priority: 'NORMAL',
        frequency: 'OCCASIONAL',
      },
    ],
  },
  {
    id: 'PATCH_PANEL',
    photos: [patchPanelImg],
    shortName: 'Patch Panel',
    fullName: 'Network Patch Panel',
    category: 'NETWORK',
    description:
      'Passive panel in the comms cabinet where all structured cabling terminates. Each port is patched to a switch port.',
    typicalLocations: ['Back office / Comms cabinet'],
    namingPattern: 'PP-<CAB#>-<PORT>',
    examples: ['PP1-01', 'PP1-12'],
    locationHint:
      'In the comms cabinet above/below the switch. The cable for any device you trace runs to a patch panel port, then a short patch cable to the switch.',
    searchKeywords: ['patch panel', 'pp', 'patch cable'],
    relatedDevices: [{ typeId: 'SWITCH', relation: 'Patch cables to switch ports' }],
    commonIssues: [
      {
        id: 'PP-LOOSE',
        title: 'Loose Patch Cable / No Link',
        symptoms: ['Device offline', 'Intermittent'],
        workaround: ['Reseat patch cable', 'Try adjacent port'],
        resolution: 'Reseat or replace patch cable, label ports.',
        priority: 'NORMAL',
        frequency: 'COMMON',
      },
    ],
  },
  {
    id: 'UPS',
    photos: [upsImg],
    shortName: 'UPS',
    fullName: 'Uninterruptible Power Supply',
    category: 'NETWORK',
    description:
      'Backup power for POS/critical devices. Beeps when mains fails.',
    typicalLocations: ['Back office / Comms cabinet', 'Under counter'],
    namingPattern: 'UPS-<Zone>',
    examples: ['UPS-BO', 'UPS-POS'],
    locationHint:
      'Under the counter for POS, or in the comms cabinet for network gear. Beeping = on battery or battery fault.',
    searchKeywords: ['ups', 'battery', 'beep', 'power'],
    relatedDevices: [
      { typeId: 'SWITCH', relation: 'Powers network gear' },
      { typeId: 'TC', relation: 'Backup power for POS' },
    ],
    commonIssues: [
      {
        id: 'UPS-BEEP',
        title: 'UPS Beeping / Battery',
        symptoms: ['Continuous beep', 'Battery low', 'Devices dropping during short outage'],
        workaround: ['Check mains power', 'Silence alarm if safe', 'Note battery age'],
        resolution: 'Replace battery if aged; check load.',
        priority: 'NORMAL',
        frequency: 'OCCASIONAL',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // Kiosk
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'KIOSK',
    photos: [kioskImg],
    shortName: 'Kiosk',
    fullName: 'Self-Order Kiosk',
    category: 'KIOSK',
    description:
      'Self-service ordering terminals in the dining area. Customers browse menu, pay and print receipt for order pickup.',
    typicalLocations: ['Dining area (entry wall)', 'Near counter'],
    namingPattern: 'KIOSK<NN> (e.g. KIOSK1, KIOSK2)',
    examples: ['KIOSK1', 'KIOSK2'],
    locationHint:
      'Along the dining-area wall near the entrance. Numbered KIOSK1, KIOSK2... Each has a large touchscreen and built-in payment module.',
    searchKeywords: ['kiosk', 'self order', 'kiosk 1', 'kiosk 2', 'sok', 'sok 32', 'sok32'],
    relatedDevices: [
      { typeId: 'SWITCH', relation: 'LAN uplink' },
      { typeId: 'AP', relation: 'Can fall back to WiFi' },
    ],
    specs: {
      display: 'Large touchscreen (22-32")',
      model: 'Varies (e.g. LG, Elo, Samsung)',
      ports: ['Ethernet (LAN)', 'USB', 'Cash/payment module'],
    },
    commonIssues: [
      {
        id: 'KIOSK-FREEZE',
        title: 'Kiosk Frozen / Unresponsive',
        symptoms: ['Touch not responding', 'Stuck on screen', 'Slow'],
        workaround: ['Restart kiosk app', 'Reboot kiosk', 'Check network'],
        resolution: 'Reboot. If recurring, check app version and hardware (touch controller).',
        priority: 'NORMAL',
        frequency: 'COMMON',
      },
      {
        id: 'KIOSK-PRINTER',
        title: 'Kiosk Receipt Printer',
        symptoms: ['No receipt prints', 'Paper jam'],
        workaround: ['Replace paper', 'Clear jam', 'Restart printer service'],
        resolution: 'Clear jam/paper, restart printer. Escalate if hardware.',
        priority: 'NORMAL',
        frequency: 'OCCASIONAL',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // Mobile / fulfilment
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'MCC',
    photos: [mccImg],
    shortName: 'MCC',
    fullName: 'Mobile Cashier / Order Fulfilment Device',
    category: 'KIOSK',
    description:
      'Handheld/mobile device used for McDelivery fulfilment, mobile order processing and queue-busting at the counter. Runs the mobile POS/order app.',
    typicalLocations: ['Fulfilment / packing area', 'With crew at counter (queue busting)', 'McDelivery pickup area'],
    namingPattern: 'MCC<NN> or Device-<NN>',
    examples: ['MCC1', 'MCC2'],
    locationHint:
      'Handheld unit on a dock/charger, usually near the McDelivery/packing station. Charging dock shows which unit is which.',
    searchKeywords: ['mcc', 'mobile cashier', 'mcdelivery', 'delivery device'],
    relatedDevices: [
      { typeId: 'AP', relation: 'Connects over WiFi' },
      { typeId: 'SWITCH', relation: 'Backend via network' },
    ],
    specs: {
      model: 'Varies (handheld terminal)',
      ports: ['WiFi', 'USB-C dock', 'Receipt/card add-ons'],
      power: 'Dock charging',
    },
    commonIssues: [
      {
        id: 'MCC-OFFLINE',
        title: 'MCC Offline / No Network',
        symptoms: ['Device shows offline', 'Cannot process orders', 'App crashes'],
        workaround: ['Restart the app', 'Reboot device', 'Check WiFi/AP', 'Place device back on dock'],
        resolution: 'Restart app/device, verify WiFi. Escalate if hardware/dock fault.',
        priority: 'NORMAL',
        frequency: 'COMMON',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // Peripherals & Other
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'CRT',
    photos: [crtImg],
    shortName: 'CRT / Cash Drawer',
    fullName: 'Cash Register Till / Cash Drawer',
    category: 'PERIPHERAL',
    description: 'Cash drawer attached to POS, opens on payment.',
    typicalLocations: ['Front counter (under POS)', 'DT window'],
    namingPattern: 'CRT<NN>',
    examples: ['CRT1', 'CRT2'],
    locationHint:
      'Under the counter directly below each POS terminal (TC). One drawer per cash register.',
    searchKeywords: ['crt', 'cash drawer', 'till'],
    relatedDevices: [{ typeId: 'TC', relation: 'Opens from the POS terminal' }],
    commonIssues: [
      {
        id: 'CRT-STUCK',
        title: 'Cash Drawer Won\'t Open',
        symptoms: ['Drawer stuck', 'Key required to open'],
        workaround: ['Open with key', 'Check ribbon cable', 'Restart POS'],
        resolution: 'Check solenoid cable; replace drawer if faulty.',
        priority: 'LOW',
        frequency: 'RARE',
      },
    ],
  },
  {
    id: 'RCPT',
    photos: [rcptImg],
    shortName: 'Receipt Printer',
    fullName: 'POS Receipt Printer',
    category: 'PERIPHERAL',
    description: 'Thermal receipt printer at each POS station.',
    typicalLocations: ['Front counter POS', 'DT POS'],
    namingPattern: 'RCPT<NN>',
    examples: ['RCPT1', 'RCPT2'],
    locationHint:
      'Sits at each POS station, usually on the counter beside or under the terminal.',
    searchKeywords: ['rcpt', 'receipt printer', 'receipt'],
    relatedDevices: [{ typeId: 'TC', relation: 'Prints from the POS terminal' }],
    commonIssues: [
      {
        id: 'RCPT-JAM',
        title: 'Receipt Printer Issues',
        symptoms: ['Paper jam', 'Smudged prints', '"Out of paper"'],
        workaround: ['Clear jam', 'Replace roll', 'Clean head'],
        resolution: 'Clear/replace paper. Replace printer if recurring.',
        priority: 'LOW',
        frequency: 'COMMON',
      },
    ],
  },
  {
    id: 'PRINTER_SRV',
    photos: [printerSrvImg],
    shortName: 'Back Office PC',
    fullName: 'Back Office PC / Server',
    category: 'OTHER',
    description:
      'Back office computer running back office applications, reports, and sometimes acting as local server for the store.',
    typicalLocations: ['Back office'],
    namingPattern: 'BO-PC or SERVER',
    examples: ['BO-PC', 'SERVER'],
    locationHint:
      'On the back-office desk, usually near the comms cabinet. Do not confuse with the switch/delphi rack.',
    searchKeywords: ['back office pc', 'back office', 'server', 'bo pc'],
    relatedDevices: [
      { typeId: 'SWITCH', relation: 'LAN uplink' },
    ],
    commonIssues: [
      {
        id: 'BO-SLOW',
        title: 'Back Office PC Slow/Offline',
        symptoms: ['Slow', 'Cannot open reports', 'Offline'],
        workaround: ['Restart', 'Check network', 'Close background apps'],
        resolution: 'Restart, clean temp files, check network. Escalate if hardware.',
        priority: 'NORMAL',
        frequency: 'OCCASIONAL',
      },
    ],
  },
];

/** Lookup helper: find device type by short name (case-insensitive, loose match). */
export function findDeviceType(query: string): DeviceType | undefined {
  const q = query.trim().toLowerCase();
  return deviceTypes.find(
    (d) =>
      d.shortName.toLowerCase() === q ||
      d.fullName.toLowerCase().includes(q) ||
      d.id.toLowerCase() === q
  );
}

/** Search across device types (includes location hints and keywords). */
export function searchDeviceTypes(query: string): DeviceType[] {
  const q = query.trim().toLowerCase();
  if (!q) return deviceTypes;
  return deviceTypes.filter(
    (d) =>
      d.shortName.toLowerCase().includes(q) ||
      d.fullName.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q) ||
      d.locationHint?.toLowerCase().includes(q) ||
      d.searchKeywords?.some((k) => k.includes(q))
  );
}

export const deviceCategories: Record<DeviceType['category'], string> = {
  POS: 'Point of Sale',
  KDS: 'Kitchen Display System',
  COD: 'Customer Order Display',
  KVS: 'Kitchen Video System',
  DRIVE_THRU: 'Drive-Thru',
  NETWORK: 'Network / Infrastructure',
  KIOSK: 'Self-Order Kiosk',
  PERIPHERAL: 'Peripherals',
  OTHER: 'Other',
};
