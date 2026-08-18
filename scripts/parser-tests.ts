import assert from 'node:assert/strict';
import { parseTicketEmail, detectDevices, matchProblem } from '../src/utils/ticketParser.ts';

const OLD_SAMPLE = `SLA for this ticket is Priority 3 - NORMAL.
Please note SLA TTR (Time to resolve) for this ticket will be end on 01-08-2026 08:14 .

Details of the ticket as follows:-
Hi Osnet,

Good day to you.

Kindly assist for below issue:

Reporter Name: Store Manager
Reporter Phone: 01X-XXX XXXX
Store : #385 PEARL POINT DT
Issue :COD 2 | BLANK
Ticket Number: ITH0385260028
Priority: Normal

Workaround:

User inform cod 2 blank (white screen )
Check from our side (ok ) > both screen able to remote |
Guide user to restart cod 2 > issue persists |
Guide user to reseat cable and delphi modem > issue persists |
User request onsite visit for further checking |`;

const SOK_SAMPLE = `SLA for this ticket is Priority 2 - HIGH.
Please note SLA TTR (Time to resolve) for this ticket will be end on 02-08-2026 05:29 .
 
Details of the ticket as follows:-
Hi Osnet,

Kindly assist below store:

Reporter Name : MUHAMMAD SHAM

Reporter Phone : 01110690739

Store Number :  1010377 SHAFTSBURY DT

Issue : SOK 32 Fail to Print Receipt 

Ticket : ITH0377260048

Activity Number : N/A

Priority: High

Workaround:  

SOK 32 have power but unable to print receipt
Assist user to unscrew printer holder & reseat all cable in Printer SOK
Restart SOK, issue persist
Suspect cable printer issue
Escalate to Osnet for further assistance`;

const cases: { name: string; run: () => void }[] = [];

function test(name: string, run: () => void) {
  cases.push({ name, run });
}

test('old format (COD 2) parses', () => {
  const p = parseTicketEmail(OLD_SAMPLE);
  assert.ok(p, 'should parse');
  assert.equal(p.ticketNumber, 'ITH0385260028');
  assert.equal(p.storeNumber, '385');
  assert.equal(p.storeName, 'PEARL POINT DT');
  assert.equal(p.priority, 'NORMAL');
  const d = detectDevices(p);
  assert.ok(d.length > 0, 'should detect a device');
  assert.equal(d[0].shortName.toLowerCase(), 'cod');
  const m = matchProblem(p, d[0]);
  assert.ok(m, 'should match a known issue');
});

test('SOK format (Store Number / Ticket :) parses without crashing', () => {
  const p = parseTicketEmail(SOK_SAMPLE);
  assert.ok(p, 'should parse');
  assert.equal(p.ticketNumber, 'ITH0377260048');
  assert.equal(p.storeNumber, '1010377');
  assert.equal(p.storeName, 'SHAFTSBURY DT');
  assert.equal(p.priority, 'HIGH');
  assert.equal(p.issue, 'SOK 32 Fail to Print Receipt');
  const d = detectDevices(p);
  assert.ok(
    d.some((x) => x.matched.toLowerCase().includes('sok')),
    'SOK should resolve to the kiosk device'
  );
  assert.equal(d[0].deviceTypeId, 'KIOSK');
});

test('SOK ticket matches the kiosk receipt printer issue', () => {
  const p = parseTicketEmail(SOK_SAMPLE);
  assert.ok(p);
  const d = detectDevices(p);
  const kiosk = d.find((x) => x.deviceTypeId === 'KIOSK');
  assert.ok(kiosk, 'kiosk should be detected');
  const m = matchProblem(p, kiosk);
  assert.ok(m, 'should match a known issue');
  assert.equal(m.title, 'Kiosk Receipt Printer');
  assert.equal(m.confidence, 'high');
});

test('short / empty input returns null', () => {
  assert.equal(parseTicketEmail(''), null);
  assert.equal(parseTicketEmail('   '), null);
  assert.equal(parseTicketEmail('hello world, this is not a ticket'), null);
});

test('bare store number without # parses', () => {
  const p = parseTicketEmail(
    'Ticket : ITH0000000001\nStore Number : 424 AMERIN BALAKONG DT\nIssue : KVS Presenter | Offline\nPriority: Normal'
  );
  assert.ok(p);
  assert.equal(p.ticketNumber, 'ITH0000000001');
  assert.equal(p.storeNumber, '424');
  assert.equal(p.storeName, 'AMERIN BALAKONG DT');
});

test('missing issue does not crash', () => {
  const p = parseTicketEmail(
    'Ticket Number: ITH0000000002\nStore : #385 PEARL POINT DT\nPriority: Normal'
  );
  assert.ok(p);
  assert.equal(p.ticketNumber, 'ITH0000000002');
  assert.equal(p.storeNumber, '385');
});

test('inline SLA priority fallback', () => {
  const p = parseTicketEmail(
    'SLA for this ticket is Priority 2 - HIGH.\nTicket : ITH0000000009\nStore : #385 PEARL POINT DT\nIssue : COD 2 blank'
  );
  assert.ok(p);
  assert.equal(p.priority, 'HIGH');
  assert.equal(p.issue, 'COD 2 blank');
});

test('multi-line issue captures full text', () => {
  const p = parseTicketEmail(
    'Ticket : ITH0000000010\nStore : #385 PEARL POINT DT\nIssue : COD 2 blank\nscreen stays white after reboot\nPriority: Normal\nWorkaround:\nrestarted device'
  );
  assert.ok(p);
  assert.equal(p.issue, 'COD 2 blank\nscreen stays white after reboot');
});

test('forwarded header still parses ticket', () => {
  const p = parseTicketEmail(
    'FW: Re: Ticket\nTicket : ITH0000000003\nStore : #385 PEARL POINT DT\nIssue : COD 2 blank\nPriority: High'
  );
  assert.ok(p);
  assert.equal(p.ticketNumber, 'ITH0000000003');
});

test('SLA deadline extracted from the SLA TTR header (MY time)', () => {
  const oldP = parseTicketEmail(OLD_SAMPLE);
  assert.ok(oldP);
  // 01-08-2026 08:14 +08:00 -> UTC 2026-08-01T00:14:00.000Z
  assert.equal(oldP.slaDeadline, '2026-08-01T00:14:00.000Z');

  const sokP = parseTicketEmail(SOK_SAMPLE);
  assert.ok(sokP);
  // 02-08-2026 05:29 +08:00 -> UTC 2026-08-01T21:29:00.000Z
  assert.equal(sokP.slaDeadline, '2026-08-01T21:29:00.000Z');
});

test('SLA deadline is absent when the email has no SLA header', () => {
  const p = parseTicketEmail(
    'Ticket : ITH0000000011\nStore : #385 PEARL POINT DT\nIssue : COD 2 blank\nPriority: High'
  );
  assert.ok(p);
  assert.equal(p.slaDeadline, undefined);
});

let failures = 0;
for (const c of cases) {
  try {
    c.run();
    console.log(`PASS ${c.name}`);
  } catch (e) {
    failures += 1;
    console.error(`FAIL ${c.name}`);
    console.error(e instanceof Error ? e.message : e);
  }
}

if (failures > 0) {
  console.error(`\n${failures}/${cases.length} tests failed`);
  process.exit(1);
}
console.log(`\n${cases.length}/${cases.length} tests passed`);
