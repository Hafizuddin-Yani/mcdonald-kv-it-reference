import { useEffect, useState } from 'react';
import { stores } from '../data/stores';
import type { Store } from '../types';

/** Returns the store for a given id/number, with a loading-friendly pattern for future async data. */
export function useStore(storeId: string | undefined): Store | undefined {
  const [store, setStore] = useState<Store | undefined>(undefined);

  useEffect(() => {
    if (!storeId) {
      setStore(undefined);
      return;
    }
    setStore(stores.find((s) => s.id === storeId || s.number === storeId));
  }, [storeId]);

  return store;
}

/** Returns all stores (future: fetch from API/worker). */
export function useStores(): Store[] {
  return stores;
}
