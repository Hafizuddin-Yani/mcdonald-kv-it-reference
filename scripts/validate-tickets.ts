import { tickets } from '../src/data/tickets.ts';
import { stores } from '../src/data/stores.ts';

/**
 * Validates the committed reference tickets (src/data/tickets.ts) and cross-
 * checks them against the store directory.
 * Guards the shared data: required fields, valid enums, and PII - raw emails,
 * real reporter names and real phone numbers must never be committed.
 */
const PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'CRITICAL'];
const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const errors: string[] = [];

const ids = new Set<string>();
for (const t of tickets) {
  const where = t?.id ? `tickets[${t.id}]` : 'ticket';
  if (!t?.id || typeof t.id !== 'string' || !t.id.trim()) {
    errors.push(`${where}: missing or invalid id`);
  } else if (ids.has(t.id)) {
    errors.push(`${where}: duplicate id`);
  } else {
    ids.add(t.id);
  }
  if (!t.storeNumber) errors.push(`${where}: missing storeNumber`);
  if (!t.deviceShortName) errors.push(`${where}: missing deviceShortName`);
  if (!t.issue) errors.push(`${where}: missing issue`);
  if (!PRIORITIES.includes(t.priority)) errors.push(`${where}: invalid priority "${t.priority}"`);
  if (!STATUSES.includes(t.status)) errors.push(`${where}: invalid status "${t.status}"`);
  if (Number.isNaN(new Date(t.createdAt).getTime())) errors.push(`${where}: invalid createdAt`);
  if ('raw' in t && t.raw) errors.push(`${where}: raw email must not be committed (PII guard)`);
  if (!t.reporter?.name) errors.push(`${where}: missing reporter.name`);
  if (!t.reporter?.phone) errors.push(`${where}: missing reporter.phone`);
  if (t.reporter && /^01\d[\d\s-]{7,}$/.test(t.reporter.phone)) {
    errors.push(`${where}: reporter.phone looks like a real number - use a placeholder (PII guard)`);
  }
  if (t.reporter && t.reporter.name !== 'Store Manager' && /^[A-Z][a-z]+ [A-Z][a-z]+/.test(t.reporter.name)) {
    errors.push(`${where}: reporter.name looks like a real person - use "Store Manager" (PII guard)`);
  }
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  console.error(`\n${errors.length} validation error(s) in src/data/tickets.ts`);
  process.exit(1);
}
console.log(`validate: OK - ${tickets.length} reference ticket(s) look good`);

// ── Store data coverage (informational, not blocking) ─────────────────────
// Surfacing real gaps so reference data can be completed from ticket history
// and site visits. Nothing here is fabricated.
const storeNumbers = new Set(stores.map((s) => s.number));
const missingStores = new Map<string, number>();
const referenced = new Set<string>();
for (const t of tickets) {
  if (!t.storeNumber) continue;
  referenced.add(t.storeNumber);
  if (!storeNumbers.has(t.storeNumber)) {
    missingStores.set(t.storeNumber, (missingStores.get(t.storeNumber) ?? 0) + 1);
  }
}

const placeholderPhone = /^01X-|^012-00000/;
const placeholderCount = stores.filter(
  (s) => s.manager.name === 'Store Manager' || placeholderPhone.test(s.manager.phone)
).length;
const realContactCount = stores.length - placeholderCount;

console.log('\nStore data coverage:');
console.log(`- ${stores.length} stores in the directory`);
console.log(`- ${referenced.size} distinct store number(s) referenced by tickets`);
if (missingStores.size > 0) {
  for (const [num, count] of [...missingStores.entries()].sort()) {
    console.log(`- MISSING from directory: store #${num} referenced by ${count} ticket(s)`);
  }
} else {
  console.log('- all ticket store numbers resolve to the directory');
}
console.log(
  `- ${realContactCount} store(s) with a real manager contact, ${placeholderCount} still using placeholders`
);
