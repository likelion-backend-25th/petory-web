export interface PetRanking {
  memberId: number;
  nickname: string;
  profileImage: string | null;
  followerCount: number;
}

export interface RankingSlice {
  content: PetRanking[];
  hasNext: boolean;
  lastMemberId: number | null;
  lastFollowerCount: number | null;
}
