import { useMemo } from 'react';
import { useParams, Link } from 'react-router';
import {
  MapPin,
  Phone,
  User,
  Wifi,
  Boxes,
  ArrowLeft,
  History,
  FileText,
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { useStore } from '../hooks/useStoreData';
import { useDeviceTypes } from '../hooks/useDeviceData';
import { useSavedTickets } from '../hooks/useSavedTickets';
import { getTicketsByStore } from '../data/tickets';
import { formatDistrict, formatStoreFormat, formatDate, telLink } from '../utils';

export default function StoreDetail() {
  const { storeId } = useParams<{ storeId: string }>();
  const store = useStore(storeId);
  const deviceTypes = useDeviceTypes();
  const { saved } = useSavedTickets();
  const tickets = useMemo(() => {
    if (!store) return [];
    const local = saved.filter(
      (t) => t.storeNumber === store.number || t.storeNumber === store.id
    );
    const ref = getTicketsByStore(store.number);
    const seen = new Set<string>();
    const merged = [];
    for (const t of [...local, ...ref]) {
      if (seen.has(t.id)) continue;
      seen.add(t.id);
      merged.push(t);
    }
    return merged;
  }, [store, saved]);

  if (!store) {
    return (
      <div className="animate-fade-up">
        <Link to="/stores" className="inline-flex items-center gap-2 text-sm font-medium text-mcd-red hover:text-mcd-red-dark transition-colors mb-6 bg-mcd-red/5 hover:bg-mcd-red/10 px-3 py-1.5 rounded-full">
          <ArrowLeft className="w-4 h-4" /> Back to stores
        </Link>
        <EmptyState title="Store not found" message="Check the store number and try again." />
      </div>
    );
  }

  const deviceTypeById = (id: string) => deviceTypes.find((d) => d.id === id);

  return (
    <div className="animate-fade-up">
      <Breadcrumbs
        items={[
          { label: 'Stores', to: '/stores' },
          { label: `#${store.number} ${store.name}` },
        ]}
      />

      <PageHeader
        title={
          <span className="flex items-center gap-3 flex-wrap">
            <span className="text-mcd-red drop-shadow-sm">#{store.number}</span> 
            <span>{store.name}</span>
          </span>
        }
        subtitle={`${store.address}`}
        action={
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <Badge variant={store.format === 'DT' ? 'red' : 'gray'}>
              {formatStoreFormat(store.format)}
            </Badge>
            <Badge variant="blue">{formatDistrict(store.district)}</Badge>
          </div>
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader
              title="Store Information"
              subtitle={`Last audited ${store.lastAuditDate ? formatDate(store.lastAuditDate) : 'never'} · by ${store.auditBy ?? '—'}`}
            />
            <CardBody className="grid sm:grid-cols-2 gap-5">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-mcd-gray-50/50 dark:bg-mcd-gray-800/30">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white shadow-sm border border-mcd-gray-100 dark:bg-mcd-gray-700 dark:border-mcd-gray-600 shrink-0">
                  <MapPin className="w-4 h-4 text-mcd-red" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-mcd-gray-400">Address</div>
                  <div className="text-sm font-medium text-mcd-gray-700 dark:text-mcd-gray-200 mt-0.5">
                    {store.address}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-mcd-gray-50/50 dark:bg-mcd-gray-800/30">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white shadow-sm border border-mcd-gray-100 dark:bg-mcd-gray-700 dark:border-mcd-gray-600 shrink-0">
                  <Wifi className="w-4 h-4 text-accent-blue" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-mcd-gray-400">Format</div>
                  <div className="text-sm font-medium text-mcd-gray-700 dark:text-mcd-gray-200 mt-0.5">
                    {formatStoreFormat(store.format)}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-mcd-gray-50/50 dark:bg-mcd-gray-800/30">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white shadow-sm border border-mcd-gray-100 dark:bg-mcd-gray-700 dark:border-mcd-gray-600 shrink-0">
                  <User className="w-4 h-4 text-accent-green" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-mcd-gray-400">
                    Store Manager
                  </div>
                  <div className="text-sm font-medium text-mcd-gray-900 dark:text-mcd-gray-50 mt-0.5">
                    {store.manager.name} <span className="text-mcd-gray-400 font-normal">({store.manager.role})</span>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-mcd-gray-50/50 dark:bg-mcd-gray-800/30">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white shadow-sm border border-mcd-gray-100 dark:bg-mcd-gray-700 dark:border-mcd-gray-600 shrink-0">
                  <Phone className="w-4 h-4 text-mcd-yellow-dark" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-mcd-gray-400">
                    Contact
                  </div>
                  <a
                    href={telLink(store.manager.phone)}
                    className="text-sm text-mcd-red hover:text-mcd-red-dark transition-colors font-semibold mt-0.5 block"
                  >
                    {store.manager.phone}
                  </a>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title={
                <span className="flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-mcd-gray-400" /> Device Inventory
                </span>
              }
              subtitle={`${store.devices.length} known devices. Verify and update during site visits.`}
            />
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-mcd-gray-400 border-b border-mcd-gray-100/80 dark:border-mcd-gray-700/40 bg-mcd-gray-50/50 dark:bg-mcd-gray-800/30">
                      <th className="px-5 py-3 rounded-tl-xl">Device</th>
                      <th className="px-5 py-3">Location in Store</th>
                      <th className="px-5 py-3 rounded-tr-xl">Asset Tag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-mcd-gray-100/50 dark:divide-mcd-gray-700/30">
                    {store.devices.map((d, i) => {
                      const type = deviceTypeById(d.typeId);
                      return (
                        <tr key={i} className="hover:bg-mcd-gray-50/80 dark:hover:bg-mcd-gray-800/40 transition-colors group">
                          <td className="px-5 py-3.5">
                            {type ? (
                              <Link
                                to={`/devices/${type.id}`}
                                className="font-mono font-semibold text-mcd-red group-hover:text-mcd-red-dark transition-colors"
                              >
                                {type.shortName}
                                {d.index ? <span className="text-mcd-gray-400"> {d.index}</span> : ''}
                              </Link>
                            ) : (
                              <span className="font-mono font-semibold">{d.typeId}</span>
                            )}
                            {d.model && (
                              <div className="text-[11px] text-mcd-gray-400 mt-1">{d.model}</div>
                            )}
                          </td>
                          <td className="px-5 py-3.5 font-medium text-mcd-gray-700 dark:text-mcd-gray-200">
                            {d.location}
                          </td>
                          <td className="px-5 py-3.5 font-mono text-xs text-mcd-gray-500 dark:text-mcd-gray-400">
                            {d.assetTag || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title={
                <span className="flex items-center gap-2">
                  <History className="w-4 h-4 text-mcd-gray-400" /> Recent Tickets
                </span>
              }
              subtitle={`${tickets.length} ticket${tickets.length === 1 ? '' : 's'} reported for this store`}
            />
            <CardBody className="p-0">
              {tickets.length === 0 ? (
                <div className="p-8 text-center text-sm text-mcd-gray-500">
                  <div className="w-12 h-12 bg-mcd-gray-50 dark:bg-mcd-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <History className="w-5 h-5 text-mcd-gray-300" />
                  </div>
                  No tickets on record yet.
                </div>
              ) : (
                <ul className="divide-y divide-mcd-gray-100/50 dark:divide-mcd-gray-700/30">
                  {tickets.map((t) => (
                    <li key={t.id} className="p-4 hover:bg-mcd-gray-50/50 dark:hover:bg-mcd-gray-800/30 transition-colors flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-mcd-gray-900 dark:text-mcd-gray-50 truncate">
                          <span className="font-mono font-bold text-mcd-red">{t.deviceShortName}</span> <span className="text-mcd-gray-300 mx-1">·</span> {t.issue}
                        </div>
                        <div className="mt-1 text-[11px] text-mcd-gray-400 font-medium">
                          <Link to="/tickets" className="hover:text-mcd-gray-600 dark:hover:text-mcd-gray-200 transition-colors">
                            {t.id}
                          </Link>
                          <span className="mx-1.5">•</span>
                          {formatDate(t.createdAt)}
                        </div>
                      </div>
                      <Badge variant={t.status === 'OPEN' ? 'yellow' : 'green'}>
                        {t.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="p-5 bg-gradient-to-br from-mcd-gray-50 to-white dark:from-mcd-gray-800/50 dark:to-mcd-gray-900/50 border-mcd-gray-200/60 shadow-sm">
            <h3 className="font-semibold text-mcd-gray-900 dark:text-mcd-gray-50 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-mcd-gray-400" /> Notes
            </h3>
            <p className="text-sm text-mcd-gray-600 dark:text-mcd-gray-300 leading-relaxed">
              {store.notes ?? 'No notes yet. Add findings from your first site visit.'}
            </p>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold text-mcd-gray-900 dark:text-mcd-gray-50 mb-4 flex items-center gap-2">
              <Boxes className="w-4 h-4 text-mcd-gray-400" /> Common in this store
            </h3>
            <div className="space-y-2.5 text-sm">
              {store.devices.slice(0, 6).map((d, i) => {
                const type = deviceTypeById(d.typeId);
                return (
                  <div key={i} className="flex items-center justify-between gap-3 group">
                    <span className="font-mono font-semibold text-mcd-red group-hover:text-mcd-red-dark transition-colors">
                      {type?.shortName ?? d.typeId}
                    </span>
                    <span className="text-[11px] font-medium text-mcd-gray-500 dark:text-mcd-gray-400 text-right truncate">
                      {d.location}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
