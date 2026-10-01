/**
 * Ticket parser CLI for McDonald's MY Klang Valley IT tickets.
 *
 * Reuses the exact same parsing logic as the in-browser Ticket Assistant
 * (parseTicketEmail() / detectDevices() in src/utils/ticketParser.ts) so this
 * CLI path and the live browser parser can never drift apart again. Reporter
 * name/phone are scrubbed with scrubReporter() - the same PII guard the rest
 * of the app uses - so raw contact details never reach the printed JSON.
 *
 * Paste raw ticket emails into `src/scripts/input-tickets.txt` (each ticket
 * starting with its own "SLA for this ticket is Priority ..." header), then
 * run:
 *
 *   npm run parse:tickets
 *
 * (or directly: `node --experimental-strip-types --no-warnings
 * --experimental-loader ./scripts/svg-loader.mjs src/scripts/parse-tickets.ts`)
 *
 * It prints JSON matching the `Ticket[]` shape (src/types) that you can copy
 * into `src/data/tickets.ts`. `createdAt` is set to the time you ran the
 * script (the emails don't carry a separate "created" timestamp) - edit it
 * if you know the real ticket creation time. `assignedTo` is left out for
 * you to fill in with the engineer who actually worked the ticket.
 */
import fs from 'node:fs';
import { parseTicketEmail, detectDevices } from '../utils/ticketParser.ts';
import { scrubReporter } from '../utils/scrub.ts';
import type { Ticket } from '../types';

const inputPath = process.argv[2] ?? 'src/scripts/input-tickets.txt';

function parseTicket(raw: string): Ticket | null {
  const parsed = parseTicketEmail(raw);
  if (!parsed) return null;

  const detected = detectDevices(parsed);
  const createdAt = new Date().toISOString();

  return {
    id: parsed.ticketNumber,
    storeNumber: parsed.storeNumber,
    deviceShortName: detected[0]?.shortName ?? '',
    issue: parsed.issue,
    priority: parsed.priority,
    status: 'OPEN',
    createdAt,
    slaDeadline: parsed.slaDeadline,
    reporter: scrubReporter(),
    workaround: parsed.workaround || undefined,
  };
}

function main() {
  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    console.error('Create it with your raw ticket emails separated by blank lines, then re-run.');
    process.exit(1);
  }

  const content = fs.readFileSync(inputPath, 'utf8');
  // Split on a fresh SLA header (each ticket email starts with one),
  // keeping the header in each block.
  const parts = content.split(/(?=\n?SLA for this ticket is Priority)/i);
  const blocks = parts.filter((b) => b.trim().length > 20);

  const tickets = blocks
    .map(parseTicket)
    .filter((t): t is Ticket => t !== null && Boolean(t.id || t.storeNumber));

  console.log(JSON.stringify(tickets, null, 2));
  console.error(`\nParsed ${tickets.length} ticket(s). Copy the JSON above into src/data/tickets.ts`);
  console.error(
    'Note: createdAt was set to now - edit it (and add assignedTo) if you know the real values.'
  );
}

main();
