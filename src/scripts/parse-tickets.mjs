/**
 * Ticket parser for McDonald's MY Klang Valley IT tickets.
 *
 * Paste raw ticket emails into `src/scripts/input-tickets.txt` (one ticket
 * per entry) and run:
 *
 *   node src/scripts/parse-tickets.mjs < input-file
 *
 * It extracts: Ticket Number, Store #, Store Name, Reporter, Issue line,
 * Priority, and the Workaround block, then prints JSON you can copy into
 * `src/data/tickets.ts`.
 *
 * NOTE: This file is plain ESM (.mjs) so it can run with `node` directly.
 */
import fs from 'node:fs';

const inputPath = process.argv[2] ?? 'src/scripts/input-tickets.txt';

function extract(pattern, text) {
  const m = text.match(pattern);
  return m ? m[1].trim() : '';
}

function parseTicket(raw) {
  const id =
    extract(/^\s*Ticket\s*(?:Number|ID)\s*:\s*([A-Za-z0-9_-]+)/im, raw) ||
    extract(/ITH\d+/i, raw);

  const storeLine = extract(/^\s*Store\s*:\s*(.+)/im, raw);
  const storeMatch = storeLine.match(/#(\d+)\s+([^\n]+)/i);
  const storeNumber = storeMatch ? storeMatch[1] : '';
  const storeName = storeMatch ? storeMatch[2].trim() : storeLine;

  const issueLine = extract(/^\s*Issue\s*:\s*(.+)/im, raw);

  const priorityRaw = extract(/^\s*Priority\s*:\s*(.+)/im, raw);
  const priority = priorityRaw.toUpperCase().includes('CRITICAL')
    ? 'CRITICAL'
    : priorityRaw.toUpperCase().includes('HIGH')
      ? 'HIGH'
      : priorityRaw.toUpperCase().includes('NORMAL') || priorityRaw.includes('P3')
        ? 'NORMAL'
        : 'LOW';

  const reporterName = extract(/^\s*Reporter\s*Name\s*:\s*(.+)/im, raw);
  const reporterPhone = extract(/^\s*Reporter\s*Phone\s*:\s*([^\n]+)/im, raw);

  const workaroundMatch = raw.match(/Workaround\s*:([\s\S]*?)(?:\nSLA|\nDetails of the ticket|\nTicket Number|$)/i);
  const workaround = workaroundMatch
    ? workaroundMatch[1].trim().replace(/\s+/g, ' ')
    : '';

  return {
    id,
    storeNumber,
    storeName,
    issue: issueLine,
    priority,
    reporterName,
    reporterPhone,
    workaround,
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

  const tickets = blocks.map(parseTicket).filter((t) => t.id || t.storeNumber);

  console.log(JSON.stringify(tickets, null, 2));
  console.error(`\nParsed ${tickets.length} ticket(s). Copy the JSON above into src/data/tickets.ts`);
}

main();
