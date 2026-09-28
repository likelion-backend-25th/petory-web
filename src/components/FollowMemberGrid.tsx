import { Link } from "react-router";
import { X } from "lucide-react";
import { toHandle } from "@/lib/postFormat";
import type { FollowMember } from "@/types/profile";

interface FollowMemberGridProps {
  members: FollowMember[];
  canRemove: boolean;
  onRemove: (memberId: number) => void;
}

function Face({ nickname, profileImage }: { nickname: string; profileImage: string | null }) {
  if (profileImage) {
    return (
      <img src={profileImage} alt="" className="size-24 rounded-full border-2 border-neutral-900 object-cover" />
    );
  }
  return (
    <span className="flex size-24 items-center justify-center rounded-full border-2 border-neutral-900 text-2xl">
      {nickname.slice(0, 1) || "P"}
    </span>
  );
}

export function FollowMemberGrid({ members, canRemove, onRemove }: FollowMemberGridProps) {
  if (members.length === 0) {
    return <p className="py-10 text-center text-sm text-neutral-500">아직 목록이 없습니다.</p>;
  }

  return (
    <ul className="grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-4">
      {members.map((member) => (
        <li key={member.id} className="flex flex-col items-center text-center">
          <div className="relative">
            <Link to={`/profile/${member.id}`}>
              <Face nickname={member.nickname} profileImage={member.profileImage} />
            </Link>
            {canRemove ? (
              <button
                type="button"
                aria-label={`${member.nickname} 삭제`}
                className="absolute -top-1 -left-1 flex size-6 items-center justify-center rounded-full bg-red-500 text-white"
                onClick={() => onRemove(member.id)}
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>
          <p className="mt-2 text-sm font-medium">{member.nickname}</p>
          <p className="text-xs text-neutral-500">{toHandle(member.nickname)}</p>
        </li>
      ))}
    </ul>
  );
}
