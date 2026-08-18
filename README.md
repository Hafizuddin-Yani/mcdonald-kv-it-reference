# MY-KV IT Reference (mcd-mykv-it-ref)

Mobile-first web app for McDonald's **Malaysia Klang Valley** IT field engineers.
Find stores, decode device naming, learn where devices live in the store, and
walk through common troubleshooting - without disturbing the store manager.

Built with **React + Vite + TypeScript + Tailwind CSS**.

---

## Getting Started

```bash
npm install
npm run dev        # start local dev server (http://localhost:5173)
npm run build      # production build (outputs to dist/)
npm run lint       # oxlint
npm run preview    # preview the production build
```

## What's Inside

| Route | Purpose |
|-------|---------|
| `/` | Dashboard - stats, quick links, recent tickets, quick decoder |
| `/stores` | All Klang Valley stores, filterable by district, searchable |
| `/stores/:id` | Store detail - contacts, device inventory, ticket history |
| `/devices` | Device catalog (TC, KVS, COD, Delphi, DT headsets, kiosks…) |
| `/devices/:id` | Device detail - naming pattern, locations, specs, common issues |
| `/naming` | Naming conventions + "decoder" for ticket terms |
| `/troubleshooting` | All common issues and workarounds, searchable |
| `/onboarding` | New engineer checklist, ticket-reading guide, golden rules |

## Adding Real Data

All data is plain TypeScript files under `src/data/` - no backend needed.

- **`deviceTypes.ts`** — the device catalog. Add new devices you discover.
- **`stores.ts`** — store master list. Edit the `seedStores` array.
- **`tickets.ts`** — parsed tickets shown on dashboard/store pages.
- **`naming.ts`** — naming conventions and the ticket-term decoder.

### Parsing tickets automatically

Paste raw ticket emails into `src/scripts/input-tickets.txt` (separate tickets
by any text), then run:

```bash
node src/scripts/parse-tickets.mjs
```

It prints JSON you can copy into `src/data/tickets.ts`.

## Device Inventory Workflow (Site Visits)

1. Open the store page, check the existing inventory.
2. In the store, go to the **comms cabinet** first (usually back office).
3. Trace LAN runs: patch panel port → switch port → device. Note the port.
4. Verify device labels (short name + asset tag), take photos.
5. Update `stores.ts` when you return.

## Deployment Ideas

- **Internal only**: build and host on the internal web server / SharePoint
  page. Keep the repo private.
- **GitHub Pages** (private repo + VPN): `npm run build`, then serve `dist/`.
- Add a Service Worker (Workbox) later for true offline field use.

> IMPORTANT: Do not publish store manager phone numbers, network details, or
> anything sensitive publicly. Keep this app internal-only.

## Project Structure

```
src/
  components/
    layout/      # Header (search + theme), Sidebar, AppLayout
    ui/          # Card, Badge, SearchInput, PageHeader, etc.
    stores/      # StoreCard
    devices/     # DeviceCard
  data/          # deviceTypes.ts, stores.ts, tickets.ts, naming.ts, config.ts
  hooks/         # useStoreData, useDeviceData, useTheme, useSearch
  pages/         # Dashboard, Stores, StoreDetail, Devices, DeviceDetail, ...
  types/         # Shared TypeScript types
  utils/         # Formatters and helpers
  scripts/       # parse-tickets.mjs (ticket parser)
```
