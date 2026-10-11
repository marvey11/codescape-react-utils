import { useCallback, useEffect, useState } from "react";

type SetValue<T> = T | ((previousValue: T) => T);

function readValue<T>(key: string, initialValue: T): T {
  if (typeof window === "undefined") return initialValue;

  try {
    const storedValue = window.localStorage.getItem(key);
    return storedValue === null ? initialValue : (JSON.parse(storedValue) as T);
  } catch {
    return initialValue;
  }
}

/** Persist a state value as JSON and keep it in sync with other tabs. */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [stored, setStored] = useState(() => ({
    key,
    value: readValue(key, initialValue),
  }));
  const value =
    stored.key === key ? stored.value : readValue(key, initialValue);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === key || event.key === null) {
        setStored({ key, value: readValue(key, initialValue) });
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [initialValue, key]);

  const updateValue = useCallback(
    (nextValue: SetValue<T>) => {
      setStored((previous) => {
        const previousValue =
          previous.key === key ? previous.value : readValue(key, initialValue);
        const resolvedValue =
          typeof nextValue === "function"
            ? (nextValue as (previousValue: T) => T)(previousValue)
            : nextValue;

        try {
          window.localStorage.setItem(key, JSON.stringify(resolvedValue));
        } catch {
          // Keep the hook usable when storage is unavailable or full.
        }

        return { key, value: resolvedValue };
      });
    },
    [initialValue, key],
  );

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore storage access errors and reset the in-memory value regardless.
    }
    setStored({ key, value: initialValue });
  }, [initialValue, key]);

  return [value, updateValue, removeValue] as const;
}
