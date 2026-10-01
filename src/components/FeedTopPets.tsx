import { useState } from "react";
import { Link } from "react-router";
import { useRanking } from "@/hooks/useRanking";

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
      {nickname.slice(0, 1) || "P"}
    </span>
  );
}

export function FeedTopPets() {
  const { pets, status } = useRanking(5);
  if (status !== "success" || pets.length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl border-2 border-neutral-900 bg-white p-4">
      <h2 className="mb-4 text-sm font-semibold">인기 펫 TOP 5</h2>
      <ul className="flex flex-wrap justify-center gap-6">
        {pets.map((pet, index) => (
          <li key={pet.memberId} className="w-16 text-center">
            <Link to={`/profile/${pet.memberId}`} className="block">
              <p className="mb-1 text-xs font-semibold">{index + 1}</p>
              <PetAvatar nickname={pet.nickname} profileImage={pet.profileImage} />
              <p className="mt-1 truncate text-xs">{pet.nickname}</p>
              <p className="text-[11px] text-neutral-500">팔로워 {pet.followerCount}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
