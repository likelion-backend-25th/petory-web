export function formatPostDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

export function normalizeHashtag(value: string): string {
  const token = value.trim().split(/\s+/)[0] ?? "";
  return token.replace(/^#+/, "");
}

export function parseHashtags(hashtags: string): string[] {
  return hashtags
    .split(/\s+/)
    .map((tag) => tag.trim())
    .filter((tag) => tag !== "");
}

export function toHandle(name: string): string {
  return `@${name.replaceAll(" ", "")}`;
}

export function isSubscriberOnly(value: number | boolean): boolean {
  return value === true || value === 1;
}
