import type { AdminMember } from "@/types/admin";

export function isBlockedStatus(status: string): boolean {
  const value = status.toUpperCase();
  return value === "BLOCKED" || value === "BANNED" || value === "SUSPENDED";
}

export function isAdminRole(role: string | undefined): boolean {
  return typeof role === "string" && role.toUpperCase().includes("ADMIN");
}

export function formatJoinDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

export function displayMemberId(member: AdminMember): string {
  if (member.email.includes("@")) {
    return `@${member.email.split("@")[0] ?? member.email}`;
  }
  if (member.email.trim() !== "") {
    return `@${member.email}`;
  }
  return `@${member.nickname.replaceAll(" ", "")}`;
}
