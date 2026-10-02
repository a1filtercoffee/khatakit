import { useMemo, useSyncExternalStore, type SetStateAction } from 'react';
import type { ZodType } from 'zod';

/** Tab-scoped recovery, with validated data and an SSR-safe first render. */
function createDraftStore<T>(key: string, initial: T, schema: ZodType<T>) {
  const storageKey = `khatakit:draft:v1:${key}`;
  let value = initial;
  let loaded = false;
  const recovery: { backup?: T } = {};
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((listener) => listener());
  const read = () => {
    if (!loaded && typeof window !== 'undefined') {
      loaded = true;
      try {
        const raw = sessionStorage.getItem(storageKey);
        const parsed = raw ? schema.safeParse(JSON.parse(raw)) : null;
        if (parsed?.success) value = parsed.data;
      } catch { /* Storage unavailable: the calculator still works. */ }
    }
    return value;
  };
  const write = (next: SetStateAction<T>) => {
    value = typeof next === 'function' ? (next as (previous: T) => T)(read()) : next;
    loaded = true;
    try {
      if (schema.safeParse(value).success) sessionStorage.setItem(storageKey, JSON.stringify(value));
      else sessionStorage.removeItem(storageKey);
    } catch { /* Private browsing or a full quota must not block editing. */ }
    emit();
  };
  const control = (event: Event) => {
    const { tool, action } = (event as CustomEvent<{ tool: string; action: string }>).detail;
    if (tool !== key.split(':')[0]) return;
    if (action === 'clear') {
      recovery.backup = read();
      write(initial);
      try { sessionStorage.removeItem(storageKey); } catch { /* Optional storage. */ }
    } else if (action === 'undo' && recovery.backup !== undefined) write(recovery.backup);
  };
  return {
    read, write,
    subscribe(listener: () => void) {
      listeners.add(listener);
      window.addEventListener('khatakit-draft-control', control);
      return () => {
        listeners.delete(listener);
        window.removeEventListener('khatakit-draft-control', control);
      };
    },
  };
}

export function useTabDraft<T>(key: string, initial: T, schema: ZodType<T>) {
  const store = useMemo(() => createDraftStore(key, initial, schema), [key, initial, schema]);
  return [useSyncExternalStore(store.subscribe, store.read, () => initial), store.write] as const;
}
