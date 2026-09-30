export interface PostListItem {
  id: number;
  type: number;
  content: string;
  bgmUrl: string | null;
  isSubscriberOnly: boolean;
  hashtags: string;
  createdAt: string;
  updatedAt: string;
  memberId: number;
  nickname: string;
  profileImage: string | null;
  imageUrls: string[];
  likeCount: number;
  commentCount: number;
}

export interface PostListSlice {
  content: PostListItem[];
  hasNext: boolean;
  lastPostId: number | null;
}

export interface PostComment {
  id: number;
  commenterId: number;
  commenterNickname: string;
  content: string;
  createdAt: string;
}

export interface PostDetail {
  id: number;
  content: string;
  bgmUrl: string | null;
  isSubscriberOnly: number;
  hashtags: string;
  memberId: number;
  authorName: string;
  authorProfileImage: string | null;
  createdAt: string;
  updatedAt: string;
  comments: PostComment[];
}

export interface PostCreateRequest {
  content: string;
  bgmUrl?: string;
  isSubscriberOnly: number;
  hashtags: string;
}

export interface PostCreateResponse {
  id: number;
}

export interface PostUpdateRequest {
  content: string;
  bgmUrl?: string;
  isSubscriberOnly: number;
  hashtags: string;
}

export interface CommentCreateRequest {
  content: string;
}

export interface LikeToggleResult {
  liked: boolean;
  likeCount: number;
}
