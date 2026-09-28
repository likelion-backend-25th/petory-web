import { useState } from "react";
import { Link } from "react-router";
import type { PostListItem } from "@/types/post";

interface TopPet {
  memberId: number;
  nickname: string;
  profileImage: string | null;
  likeCount: number;
}

function pickTopPets(posts: PostListItem[]): TopPet[] {
  const byMember = new Map<number, TopPet>();
  for (const post of posts) {
    const current = byMember.get(post.memberId);
    if (current === undefined || post.likeCount > current.likeCount) {
      byMember.set(post.memberId, {
        memberId: post.memberId,
        nickname: post.nickname,
        profileImage: post.profileImage,
        likeCount: post.likeCount,
      });
    }
  }
  return [...byMember.values()].sort((a, b) => b.likeCount - a.likeCount).slice(0, 5);
}

function PetAvatar({ nickname, profileImage }: { nickname: string; profileImage: string | null }) {
  const [failed, setFailed] = useState(false);
  if (profileImage && !failed) {
    return (
      <img
        src={profileImage}
        alt=""
        className="mx-auto size-14 rounded-full border-2 border-neutral-900 object-cover"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <span className="mx-auto flex size-14 items-center justify-center rounded-full border-2 border-neutral-900 text-lg">
      {nickname.slice(0, 1)}
    </span>
  );
}

interface FeedTopPetsProps {
  posts: PostListItem[];
}

export function FeedTopPets({ posts }: FeedTopPetsProps) {
  const pets = pickTopPets(posts);
  if (pets.length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl border-2 border-neutral-900 bg-white p-4">
      <h2 className="mb-4 text-sm font-semibold">인기 펫 TOP 5</h2>
      <ul className="flex flex-wrap justify-center gap-6">
        {pets.map((pet) => (
          <li key={pet.memberId} className="w-16 text-center">
            <Link to={`/profile/${pet.memberId}`} className="block">
              <PetAvatar nickname={pet.nickname} profileImage={pet.profileImage} />
              <p className="mt-1 truncate text-xs">{pet.nickname}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
