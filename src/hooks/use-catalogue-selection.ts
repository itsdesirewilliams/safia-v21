"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  CATALOGUE_SELECTION_EVENT,
  CATALOGUE_SELECTION_STORAGE_KEY,
  type CatalogueSelectionItem,
} from "@/lib/catalogue/selection";

function readStoredSelection(): CatalogueSelectionItem[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.sessionStorage.getItem(CATALOGUE_SELECTION_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter(
          (item): item is CatalogueSelectionItem =>
            typeof item === "object" &&
            item !== null &&
            typeof (item as CatalogueSelectionItem).key === "string" &&
            typeof (item as CatalogueSelectionItem).size === "string" &&
            typeof (item as CatalogueSelectionItem).productCode === "string",
        )
      : [];
  } catch {
    return [];
  }
}

/**
 * A small session-scoped store shared by every catalogue page. It survives
 * dedicated-page navigation, so a visitor can collect sizes from several
 * patterns, valves or flaps and submit one quotation.
 */
export function useCatalogueSelection() {
  const [items, setItems] = useState<CatalogueSelectionItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const itemsRef = useRef<CatalogueSelectionItem[]>([]);

  const apply = useCallback((next: CatalogueSelectionItem[]) => {
    itemsRef.current = next;
    setItems(next);
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.setItem(
          CATALOGUE_SELECTION_STORAGE_KEY,
          JSON.stringify(next),
        );
      } catch {
        // Storage may be unavailable in private mode; in-page selection still works.
      }
      window.dispatchEvent(
        new CustomEvent(CATALOGUE_SELECTION_EVENT, { detail: next }),
      );
    }
  }, []);

  useEffect(() => {
    const sync = () => {
      const next = readStoredSelection();
      itemsRef.current = next;
      setItems(next);
    };
    sync();
    setHydrated(true);

    const onChange = (event: Event) => {
      if (event instanceof CustomEvent) {
        const next = event.detail as CatalogueSelectionItem[];
        itemsRef.current = next;
        setItems(next);
      } else {
        sync();
      }
    };

    window.addEventListener(CATALOGUE_SELECTION_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(CATALOGUE_SELECTION_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const add = useCallback(
    (item: CatalogueSelectionItem) => {
      if (itemsRef.current.some((entry) => entry.key === item.key)) {
        return;
      }
      apply([...itemsRef.current, item]);
    },
    [apply],
  );

  const remove = useCallback(
    (key: string) => {
      apply(itemsRef.current.filter((entry) => entry.key !== key));
    },
    [apply],
  );

  const toggle = useCallback(
    (item: CatalogueSelectionItem) => {
      if (itemsRef.current.some((entry) => entry.key === item.key)) {
        remove(item.key);
      } else {
        add(item);
      }
    },
    [add, remove],
  );

  const clear = useCallback(() => apply([]), [apply]);

  return { items, hydrated, add, remove, toggle, clear };
}
