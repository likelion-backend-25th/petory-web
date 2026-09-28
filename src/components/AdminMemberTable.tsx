import { displayMemberId, formatJoinDate } from "@/lib/admin";
import type { AdminMember } from "@/types/admin";

interface AdminMemberTableProps {
  members: AdminMember[];
  actionLabel: string;
  onAction: (member: AdminMember) => void;
  disableId?: number | null;
}

export function AdminMemberTable({ members, actionLabel, onAction, disableId }: AdminMemberTableProps) {
  return (
    <div className="overflow-x-auto rounded-md border-2 border-neutral-900">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="bg-neutral-50">
            <th className="border-b-2 border-neutral-900 px-3 py-2 font-medium">ID</th>
            <th className="border-b-2 border-neutral-900 px-3 py-2 font-medium">닉네임</th>
            <th className="border-b-2 border-neutral-900 px-3 py-2 font-medium">주소</th>
            <th className="border-b-2 border-neutral-900 px-3 py-2 font-medium">가입일자</th>
            <th className="border-b-2 border-neutral-900 px-3 py-2 font-medium">차단</th>
          </tr>
        </thead>
        <tbody>
          {members.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-3 py-8 text-center text-neutral-500">
                목록이 없습니다.
              </td>
            </tr>
          ) : (
            members.map((member) => (
              <tr key={member.id}>
                <td className="border-t border-neutral-300 px-3 py-2">{displayMemberId(member)}</td>
                <td className="border-t border-neutral-300 px-3 py-2">{member.nickname || "-"}</td>
                <td className="border-t border-neutral-300 px-3 py-2">{member.address || "-"}</td>
                <td className="border-t border-neutral-300 px-3 py-2">{formatJoinDate(member.createdAt)}</td>
                <td className="border-t border-neutral-300 px-3 py-2 text-center">
                  <button
                    type="button"
                    className="rounded-md border-2 border-neutral-900 px-3 py-1 text-xs hover:bg-neutral-50 disabled:opacity-40"
                    onClick={() => onAction(member)}
                    disabled={disableId === member.id}
                  >
                    {actionLabel}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
