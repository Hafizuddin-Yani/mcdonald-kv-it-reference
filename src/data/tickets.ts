import type { Ticket } from '../types';

/**
 * Sample tickets parsed from real email examples.
 *
 * Use these as templates. Add your own by pasting raw emails and running
 * the ticket parser script (src/scripts/parse-tickets.ts), or add rows
 * manually following the same structure.
 */
export const tickets: Ticket[] = [
  {
    id: 'ITH0424260021',
    storeNumber: '424',
    deviceShortName: 'KVS Presenter',
    issue: 'KVS Counter Presenter | Offline',
    priority: 'NORMAL',
    status: 'OPEN',
    createdAt: '2026-07-25T08:31:00+08:00',
    slaDeadline: '2026-07-27T08:31:00+08:00',
    reporter: {
      name: 'Store Manager',
      phone: '01X-XXX XXXX',
    },
    workaround:
      'User inform KVS presenter counter appear 0/0 (offline). Guide user to restart TC and reseat LAN cable > issue persists. Guide user to reseat LAN cable port > issue persists. User request onsite visit for further checking.',
    assignedTo: 'Juden',
  },
  {
    id: 'ITH0385260028',
    storeNumber: '385',
    deviceShortName: 'COD',
    issue: 'COD 2 | BLANK',
    priority: 'NORMAL',
    status: 'OPEN',
    createdAt: '2026-07-30T08:14:00+08:00',
    slaDeadline: '2026-08-01T08:14:00+08:00',
    reporter: {
      name: 'Store Manager',
      phone: '01X-XXX XXXX',
    },
    workaround:
      'User inform COD 2 blank (white screen). Check from our side (ok) > both screen able to remote. Guide user to restart COD 2 > issue persists. Guide user to reseat cable and Delphi modem > issue persists. User request onsite visit for further checking.',
    assignedTo: 'Juden',
  },
  {
    id: 'ITH0424260033',
    storeNumber: '424',
    deviceShortName: 'TC',
    issue: 'TC1 | OFFLINE',
    priority: 'NORMAL',
    status: 'RESOLVED',
    createdAt: '2026-07-20T10:00:00+08:00',
    resolvedAt: '2026-07-20T11:15:00+08:00',
    reporter: {
      name: 'Store Manager',
      phone: '01X-XXX XXXX',
    },
    workaround:
      'Reseat LAN cable at TC and switch > resolved. No further action.',
    resolution: 'Loose patch cable at comms cabinet. Reseated and relabeled.',
    assignedTo: 'Juden',
  },
];

export function getTicketsByStore(storeNumber: string): Ticket[] {
  return tickets.filter((t) => t.storeNumber === storeNumber);
}

export function getTicketById(id: string): Ticket | undefined {
  return tickets.find((t) => t.id === id);
}

export const openTicketCount = tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
