const PENDING_FANCLUB_KEY = "patory-pending-fanclub";

export function canViewSubscriberPost(
  subscriberOnly: boolean,
  authorId: number,
  viewerId: number | null,
  subscribedAuthorIds: readonly number[],
): boolean {
  if (!subscriberOnly) {
    return true;
  }
  if (viewerId !== null && viewerId === authorId) {
    return true;
  }
  return viewerId !== null && subscribedAuthorIds.includes(authorId);
}

export function stageFanclubTarget(targetMemberId: number): void {
  sessionStorage.setItem(PENDING_FANCLUB_KEY, String(targetMemberId));
}

export function clearFanclubTarget(): void {
  sessionStorage.removeItem(PENDING_FANCLUB_KEY);
}

export function readFanclubTarget(): number | null {
  const raw = sessionStorage.getItem(PENDING_FANCLUB_KEY);
  if (raw === null || !/^\d+$/.test(raw)) {
    return null;
  }
  return Number(raw);
}
