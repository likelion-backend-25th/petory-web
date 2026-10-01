const STORAGE_KEY = "patory-view-counts";

function readCounts(): Record<string, number> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return {};
    }
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) {
      return {};
    }
    return parsed as Record<string, number>;
  } catch {
    return {};
  }
}

export function rememberViewCount(postId: number, viewCount: number): void {
  const counts = readCounts();
  counts[String(postId)] = viewCount;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
}

export function displayViewCount(postId: number, fromApi: number | null | undefined): number {
  if (typeof fromApi === "number") {
    rememberViewCount(postId, fromApi);
    return fromApi;
  }
  const saved = readCounts()[String(postId)];
  return typeof saved === "number" ? saved : 0;
}
