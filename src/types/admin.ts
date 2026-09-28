export interface AdminMember {
  id: number;
  email: string;
  nickname: string;
  address: string;
  status: string;
  role: string;
  createdAt: string;
}

export type AdminTab = "members" | "blocked";
