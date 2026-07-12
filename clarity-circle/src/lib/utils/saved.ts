export type SavedItemType = "post" | "product";

export interface SavedItem {
  id: string;
  type: SavedItemType;
  title: string;
  description?: string;
  href: string;
  imageURL?: string;
  savedAt: number;
}

const STORAGE_KEY = "clarity-circle-saved-items";

function parseItems(value: string | null): SavedItem[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as SavedItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getSavedItems(): SavedItem[] {
  if (typeof window === "undefined") return [];
  return parseItems(window.localStorage.getItem(STORAGE_KEY));
}

export function setSavedItems(items: SavedItem[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function isSavedItem(id: string): boolean {
  return getSavedItems().some((item) => item.id === id);
}

export function toggleSavedItem(item: SavedItem): SavedItem[] {
  const items = getSavedItems();
  const exists = items.some((saved) => saved.id === item.id);
  const next = exists ? items.filter((saved) => saved.id !== item.id) : [{ ...item, savedAt: Date.now() }, ...items];
  setSavedItems(next);
  return next;
}

export function removeSavedItem(id: string): SavedItem[] {
  const items = getSavedItems().filter((item) => item.id !== id);
  setSavedItems(items);
  return items;
}
