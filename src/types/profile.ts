export interface MemberProfile {
  id: number;
  nickname: string;
  intro: string | null;
  profileImage: string | null;
  status: string;
  role: string;
  createdAt: string;
  postsCount: number;
  followers: number;
  followings: number;
  email?: string;
}
