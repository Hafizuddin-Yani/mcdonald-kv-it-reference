import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PageHeader } from '../components/ui/PageHeader';
import { stores, districtLabels } from '../data/stores';
import { tickets as committedTickets } from '../data/tickets';
import { useSavedTickets } from '../hooks/useSavedTickets';
import type { District } from '../types';

const ticketIcon = L.divIcon({
  className: '',
  html: '<div style="width:12px;height:12px;border-radius:3px;background:#FFC72C;border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

const markerIcon = L.divIcon({
  className: '',
  html: '<div style="width:14px;height:14px;border-radius:9999px;background:#DA291C;border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 15);
      return;
    }
    map.fitBounds(points, { padding: [40, 40] });
  }, [map, points]);
  return null;
}

export default function StoreMap() {
  const [district, setDistrict] = useState<District | 'ALL'>('ALL');
  const { saved } = useSavedTickets();

  const visible = useMemo(
    () => (district === 'ALL' ? stores : stores.filter((s) => s.district === district)),
    [district]
  );
  const ticketMarkers = useMemo(() => {
    const byStore = new Map<string, { id: string; priority: string; issue: string; store?: (typeof stores)[number] }>();
    for (const t of [...committedTickets, ...saved]) {
      if (t.status !== 'OPEN' && t.status !== 'IN_PROGRESS') continue;
      if (byStore.has(t.storeNumber)) continue;
      const store = stores.find((s) => s.number === t.storeNumber);
      if (!store || (district !== 'ALL' && store.district !== district)) continue;
      byStore.set(t.storeNumber, { id: t.id, priority: t.priority, issue: t.issue, store });
    }
    return [...byStore.values()];
  }, [saved, district]);
  const points = useMemo<[number, number][]>(
    () => visible.map((s) => [s.coordinates.lat, s.coordinates.lng]),
    [visible]
  );

  return (
    <div className="animate-fade-up">
      <PageHeader title="Store Map" subtitle="Locate any store and jump straight to navigation." />

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setDistrict('ALL')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
            district === 'ALL'
              ? 'bg-gradient-to-br from-mcd-red to-mcd-red-dark text-white shadow-glow-red-sm scale-105'
              : 'bg-white dark:bg-mcd-gray-800 border border-mcd-gray-200 dark:border-mcd-gray-700/80 text-mcd-gray-600 dark:text-mcd-gray-300 hover:bg-mcd-gray-50 dark:hover:bg-mcd-gray-700'
          }`}
        >
          All Stores
        </button>
        {Object.entries(districtLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setDistrict(key as District)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              district === key
                ? 'bg-gradient-to-br from-mcd-red to-mcd-red-dark text-white shadow-glow-red-sm scale-105'
                : 'bg-white dark:bg-mcd-gray-800 border border-mcd-gray-200 dark:border-mcd-gray-700/80 text-mcd-gray-600 dark:text-mcd-gray-300 hover:bg-mcd-gray-50 dark:hover:bg-mcd-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden border border-mcd-gray-200 dark:border-mcd-gray-700/80 h-[70vh]">
        <MapContainer center={[3.0738, 101.5183]} zoom={11} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds points={points} />
          {ticketMarkers.map((t) => (
            <Marker
              key={t.id}
              position={[t.store!.coordinates.lat, t.store!.coordinates.lng]}
              icon={ticketIcon}
              zIndexOffset={1000}
            >
              <Popup>
                <div className="min-w-[180px]">
                  <div className="font-bold">
                    {t.id} · {t.priority}
                  </div>
                  <div className="text-xs text-gray-600">
                    #{t.store!.number} {t.store!.name} — {t.issue}
                  </div>
                  <div className="mt-2 text-sm">
                    <Link to="/tickets" className="text-red-600 font-semibold">
                      Open Ticket Log
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
          {visible.map((s) => (
            <Marker key={s.id} position={[s.coordinates.lat, s.coordinates.lng]} icon={markerIcon}>
              <Popup>
                <div className="min-w-[180px]">
                  <div className="font-bold">
                    #{s.number} {s.name}
                  </div>
                  <div className="text-xs text-gray-600">{s.address}</div>
                  <div className="mt-2 flex gap-3 text-sm">
                    <Link to={`/stores/${s.id}`} className="text-red-600 font-semibold">
                      Details
                    </Link>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${s.coordinates.lat},${s.coordinates.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-red-600 font-semibold"
                    >
                      Navigate
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
