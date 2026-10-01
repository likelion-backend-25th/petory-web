import { useState } from "react";
import { Link, useParams } from "react-router";
import { CalendarDays, MapPin, UserRound } from "lucide-react";
import { updateMissingPetStatus } from "@/api/missingPet";
import { KakaoMapPicker } from "@/components/KakaoMapPicker";
import { useMissingPetDetail } from "@/hooks/useMissingPetDetail";
import { formatPostDate } from "@/lib/postFormat";
import { useAuthStore } from "@/stores/useAuthStore";
import type { MissingPetStatus } from "@/types/missingPet";

const statusLabels: Record<MissingPetStatus, string> = {
  MISSING: "실종",
  FOUND: "발견",
  CANCELLED: "신고 취소",
};

const statusClasses: Record<MissingPetStatus, string> = {
  MISSING: "bg-red-100 text-red-700",
  FOUND: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-neutral-200 text-neutral-700",
};

export function MissingPetDetailPage() {
  const { missingPetId } = useParams();
  const { id, missingPet, status, errorMessage, reload } =
    useMissingPetDetail(missingPetId);
  const myId = useAuthStore((state) => state.user?.id);
  const [statusBusy, setStatusBusy] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);

  const changeStatus = async (nextStatus: "FOUND" | "CANCELLED"): Promise<void> => {
    if (id === null) {
      return;
    }
    setStatusBusy(true);
    setStatusError(null);
    try {
      await updateMissingPetStatus(id, { status: nextStatus });
      reload();
    } catch (error: unknown) {
      setStatusError(
        error instanceof Error ? error.message : "상태 변경에 실패했습니다.",
      );
    } finally {
      setStatusBusy(false);
    }
  };

  if (status === "loading") {
    return <p className="text-neutral-500">실종 신고를 불러오는 중...</p>;
  }

  if (status === "error" || !missingPet || id === null) {
    return (
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold">실종 신고를 찾을 수 없습니다</h1>
        <p className="text-sm text-red-600">{errorMessage}</p>
        <Link to="/missing-pets" className="text-sm underline">
          목록으로 돌아가기
        </Link>
      </section>
    );
  }

  const isOwner =
    myId !== undefined &&
    missingPet.author?.id !== undefined &&
    myId === missingPet.author.id;
  const currentStatus = missingPet.status;
  const reports = missingPet.reports ?? [];

  return (
    <article className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/missing-pets" className="text-sm underline">
          ← 실종 신고 목록
        </Link>
        {isOwner ? (
          <Link
            to={`/missing-pets/${id}/edit`}
            className="rounded-md border-2 border-neutral-900 px-4 py-2 text-sm font-medium"
          >
            신고 수정
          </Link>
        ) : null}
      </div>

      <section className="overflow-hidden rounded-xl border-2 border-neutral-900 bg-white">
        {missingPet.imageUrl && failedImageUrl !== missingPet.imageUrl ? (
          <img
            src={missingPet.imageUrl}
            alt={missingPet.detail ?? "실종 동물"}
            className="max-h-[34rem] w-full bg-neutral-100 object-contain"
            onError={() => setFailedImageUrl(missingPet.imageUrl ?? null)}
          />
        ) : (
          <div className="flex aspect-video items-center justify-center bg-neutral-100 text-neutral-400">
            등록된 이미지가 없습니다.
          </div>
        )}

        <div className="space-y-5 p-6">
          <header className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  currentStatus
                    ? statusClasses[currentStatus]
                    : "bg-neutral-200 text-neutral-700"
                }`}
              >
                {currentStatus ? statusLabels[currentStatus] : "상태 미상"}
              </span>
            </div>
            {missingPet.createdAt ? (
              <p className="text-xs text-neutral-500">
                {formatPostDate(missingPet.createdAt)} 등록
              </p>
            ) : null}
          </header>

          <dl className="grid gap-3 rounded-lg bg-neutral-50 p-4 text-sm sm:grid-cols-2">
            <div className="flex gap-2">
              <CalendarDays className="mt-0.5 size-4 shrink-0" aria-hidden />
              <div>
                <dt className="text-neutral-500">실종 날짜</dt>
                <dd className="font-medium">{missingPet.missingDate ?? "-"}</dd>
              </div>
            </div>
            <div className="flex gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
              <div>
                <dt className="text-neutral-500">실종 장소</dt>
                <dd className="font-medium">{missingPet.missingAddress ?? "-"}</dd>
              </div>
            </div>
            <div className="flex gap-2">
              <UserRound className="mt-0.5 size-4 shrink-0" aria-hidden />
              <div>
                <dt className="text-neutral-500">작성자</dt>
                <dd className="font-medium">
                  {missingPet.author?.id !== undefined ? (
                    <Link
                      to={`/profile/${missingPet.author.id}`}
                      className="hover:underline"
                    >
                      {missingPet.author.nickname ?? "이름 없음"}
                    </Link>
                  ) : (
                    (missingPet.author?.nickname ?? "-")
                  )}
                </dd>
              </div>
            </div>
          </dl>

          <div>
            <h2 className="font-semibold">상세 설명</h2>
            <p className="mt-2 whitespace-pre-wrap leading-relaxed">
              {missingPet.detail ?? "-"}
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-semibold">실종 위치</h2>
            {missingPet.latitude !== undefined &&
            missingPet.longitude !== undefined ? (
              <KakaoMapPicker
                latitude={missingPet.latitude}
                longitude={missingPet.longitude}
                readOnly
              />
            ) : (
              <p className="rounded-md bg-neutral-50 p-4 text-sm text-neutral-500">
                저장된 위치 정보가 없습니다.
              </p>
            )}
          </div>

          {isOwner && currentStatus === "MISSING" ? (
            <div className="space-y-3 border-t-2 border-neutral-900 pt-5">
              <h2 className="font-semibold">신고 상태 변경</h2>
              <p className="text-sm text-neutral-500">
                동물을 찾았거나 신고를 종료할 때 상태를 변경해 주세요.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={statusBusy}
                  className="rounded-md border-2 border-neutral-900 bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                  onClick={() => void changeStatus("FOUND")}
                >
                  발견 완료
                </button>
                <button
                  type="button"
                  disabled={statusBusy}
                  className="rounded-md border-2 border-neutral-900 px-4 py-2 text-sm font-medium disabled:opacity-50"
                  onClick={() => void changeStatus("CANCELLED")}
                >
                  신고 취소
                </button>
              </div>
              {statusError ? (
                <p className="text-sm text-red-600">{statusError}</p>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-xl border-2 border-neutral-900 bg-white p-6">
        <h2 className="text-lg font-semibold">목격 제보 {reports.length}건</h2>
        {reports.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-500">
            아직 등록된 목격 제보가 없습니다.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {reports.map((report, index) => (
              <li
                key={report.id ?? index}
                className="grid gap-4 rounded-lg border border-neutral-200 p-4 sm:grid-cols-[7rem_1fr]"
              >
                {report.imageUrl ? (
                  <img
                    src={report.imageUrl}
                    alt="목격 제보"
                    className="aspect-square w-full rounded-md object-cover"
                  />
                ) : (
                  <div className="flex aspect-square items-center justify-center rounded-md bg-neutral-100 text-xs text-neutral-400">
                    이미지 없음
                  </div>
                )}
                <div className="space-y-2 text-sm">
                  <p className="font-medium">
                    {report.reporter?.nickname ?? "제보자"}
                  </p>
                  <p>{report.detail ?? "-"}</p>
                  <p className="text-neutral-500">{report.address ?? "-"}</p>
                  {report.sightAt ? (
                    <p className="text-xs text-neutral-400">
                      목격 일시 {formatPostDate(report.sightAt)}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
}
