import type { Ticket } from '../types';

/** Standard SLA window (hours to resolve) per priority tier. */
export const SLA_HOURS: Record<Ticket['priority'], number> = {
  CRITICAL: 4,
  HIGH: 8,
  NORMAL: 24,
  LOW: 72,
};

export function slaHours(priority: Ticket['priority']): number {
  return SLA_HOURS[priority] ?? 24;
}

/** SLA deadline = createdAt + priority window. */
export function computeSlaDeadline(createdAt: string, priority: Ticket['priority']): string {
  return new Date(new Date(createdAt).getTime() + slaHours(priority) * 3_600_000).toISOString();
}

export type SlaState = 'OVERDUE' | 'NEAR' | 'OK' | 'NONE';

export interface SlaInfo {
  state: SlaState;
  /** Hours until the deadline (negative = overdue). 0 when not on the clock. */
  hoursLeft: number;
  deadline: string | null;
}

/**
 * Evaluate a ticket against its SLA deadline. Only OPEN / IN_PROGRESS
 * tickets are on the clock. 'NEAR' = within 25% of the window or under 4h.
 */
export function slaInfo(
  ticket: Pick<Ticket, 'createdAt' | 'priority' | 'slaDeadline' | 'status'>,
  now: number = Date.now()
): SlaInfo {
  if (ticket.status !== 'OPEN' && ticket.status !== 'IN_PROGRESS') {
    return { state: 'NONE', hoursLeft: 0, deadline: null };
  }
  const deadline = ticket.slaDeadline ?? computeSlaDeadline(ticket.createdAt, ticket.priority);
  const dl = new Date(deadline).getTime();
  if (Number.isNaN(dl)) return { state: 'NONE', hoursLeft: 0, deadline: null };
  const hoursLeft = (dl - now) / 3_600_000;
  const near = hoursLeft <= Math.max(4, slaHours(ticket.priority) * 0.25);
  return {
    state: hoursLeft <= 0 ? 'OVERDUE' : near ? 'NEAR' : 'OK',
    hoursLeft,
    deadline,
  };
}

/** Compact human label for the SLA countdown. */
export function formatSlaLeft(hoursLeft: number): string {
  if (hoursLeft <= 0) return `${Math.ceil(Math.abs(hoursLeft))}h overdue`;
  if (hoursLeft < 48) return `${Math.round(hoursLeft)}h left`;
  return `${(hoursLeft / 24).toFixed(1)}d left`;
}

export function slaBadge(state: SlaState): string {
  switch (state) {
    case 'OVERDUE':
      return 'badge-red';
    case 'NEAR':
      return 'badge-yellow';
    case 'OK':
      return 'badge-green';
    default:
      return 'badge-gray';
  }
}
