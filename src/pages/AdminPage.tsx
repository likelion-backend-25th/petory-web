import { useEffect, useState } from "react";
import { AdminMemberTable } from "@/components/AdminMemberTable";
import { AdminPagination } from "@/components/AdminPagination";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useAdminMembers } from "@/hooks/useAdminMembers";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/stores/useAuthStore";
import type { AdminMember, AdminTab } from "@/types/admin";

const PAGE_SIZE = 6;

export function AdminPage() {
  const myId = useAuthStore((state) => state.user?.id ?? null);
  const { status, errorMessage, activeMembers, blockedMembers, setBlocked } = useAdminMembers();
  const [tab, setTab] = useState<AdminTab>("members");
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<AdminMember | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const rows = tab === "members" ? activeMembers : blockedMembers;
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const visible = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [tab]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const confirm = async (): Promise<void> => {
    if (target === null) {
      return;
    }
    setBusy(true);
    setActionError(null);
    try {
      await setBlocked(target.id, tab === "members");
      setTarget(null);
    } catch (error: unknown) {
      setActionError(error instanceof Error ? error.message : "알 수 없는 오류");
      setTarget(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-xl border-2 border-neutral-900 bg-white p-6">
      <h1 className="text-2xl font-semibold">관리자님 안녕하세요!</h1>
      <p className="mt-1 text-sm text-neutral-500">관리자 전용 페이지 입니다 (담당 관리자만 볼 수있습니다.)</p>

      <div className="mt-6 flex gap-6 border-b-2 border-neutral-900 text-sm">
        <button
          type="button"
          className={cn("pb-2", tab === "members" ? "font-semibold" : "text-neutral-400")}
          onClick={() => setTab("members")}
        >
          회원 목록({activeMembers.length}명)
        </button>
        <button
          type="button"
          className={cn("pb-2", tab === "blocked" ? "font-semibold" : "text-neutral-400")}
          onClick={() => setTab("blocked")}
        >
          차단목록
        </button>
      </div>

      <div className="mt-4">
        {status === "loading" ? <p className="py-8 text-center text-sm text-neutral-500">불러오는 중...</p> : null}
        {status === "error" ? <p className="py-8 text-center text-sm text-red-600">{errorMessage}</p> : null}
        {status === "success" ? (
          <AdminMemberTable
            members={visible}
            actionLabel={tab === "members" ? "차단하기" : "차단해제"}
            onAction={setTarget}
            disableId={myId}
          />
        ) : null}
      </div>
      {actionError ? <p className="mt-3 text-sm text-red-600">{actionError}</p> : null}
      {status === "success" ? <AdminPagination page={page} totalPages={totalPages} onChange={setPage} /> : null}

      <ConfirmModal
        open={target !== null}
        busy={busy}
        title={tab === "members" ? "정말 차단하시겠습니까?" : "차단을 해제하시겠습니까?"}
        description={
          tab === "members"
            ? "차단하면 해당 서비스를 이용할 수 없어요"
            : "차단을 해제하면 서비스를 다시 이용할 수 있어요"
        }
        confirmLabel={tab === "members" ? "차단" : "차단해제"}
        onCancel={() => setTarget(null)}
        onConfirm={() => void confirm()}
      />
    </section>
  );
}
