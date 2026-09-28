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
  isFollowing: boolean;
  email?: string;
  species?: string;
  sex?: string;
  birthDate?: string;
  address?: string;
}

export interface MyPagePost {
  id: number;
  content: string;
  isSubscriberOnly: boolean;
  isSponsorOnly: boolean;
  hashtags: string;
  imageUrl: string | null;
  likeCount: number;
  commentCount: number;
}

export interface ProfileEditRequest {
  nickname: string;
  species: string;
  sex: string;
  birthDate: string;
  intro: string;
  profileImage: string;
  address: string;
}

export interface FollowMember {
  id: number;
  nickname: string;
  profileImage: string | null;
}
