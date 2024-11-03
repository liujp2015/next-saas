import { Uppy, State } from "@uppy/core";
import { useMemo } from "react";
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/shim/with-selector";

// Define IndexedObject locally, if needed
type IndexedObject<T = any> = Record<string, T>;

export function useUppyState<
  T,
  TMeta extends IndexedObject<any> = Record<string, unknown>
>(
  uppy: Uppy<TMeta>,
  selector: (state: State<TMeta, any>) => T // Added second type argument as `any`
) {
  const store = (uppy as any).store;

  const subscribe = useMemo(() => store.subscribe.bind(store), [store]);
  const getSnapshot = useMemo(() => store.getState.bind(store), [store]);

  return useSyncExternalStoreWithSelector(
    subscribe,
    getSnapshot,
    getSnapshot,
    selector
  );
}
