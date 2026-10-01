import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { updateMissingPet, uploadMissingPetImage } from "@/api/missingPet";
import {
  MissingPetForm,
  type MissingPetFormValues,
} from "@/components/missingPet/MissingPetForm";
import { useMissingPetDetail } from "@/hooks/useMissingPetDetail";
import { useAuthStore } from "@/stores/useAuthStore";

function coordinateValue(value: number | undefined): string {
  return value === undefined ? "" : String(value);
}

function optionalCoordinate(value: string): number | undefined {
  return value.trim() === "" ? undefined : Number(value);
}

export function MissingPetEditPage() {
  const { missingPetId } = useParams();
  const navigate = useNavigate();
  const myId = useAuthStore((state) => state.user?.id);
  const { id, missingPet, status, errorMessage } =
    useMissingPetDetail(missingPetId);
  const initialValues = useMemo<MissingPetFormValues>(
    () => ({
      missingDate: missingPet?.missingDate ?? "",
      missingAddress: missingPet?.missingAddress ?? "",
      detail: missingPet?.detail ?? "",
      latitude: coordinateValue(missingPet?.latitude),
      longitude: coordinateValue(missingPet?.longitude),
    }),
    [missingPet],
  );

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

  if (myId === undefined || missingPet.author?.id !== myId) {
    return (
      <section className="space-y-3 rounded-xl border-2 border-neutral-900 bg-white p-6">
        <h1 className="text-xl font-semibold">수정 권한이 없습니다</h1>
        <p className="text-sm text-neutral-600">
          본인이 작성한 실종 신고만 수정할 수 있습니다.
        </p>
        <Link to={`/missing-pets/${id}`} className="text-sm underline">
          상세로 돌아가기
        </Link>
      </section>
    );
  }

  const submit = async (
    values: MissingPetFormValues,
    imageFile: File | null,
  ): Promise<void> => {
    const imageUrl = imageFile
      ? await uploadMissingPetImage(imageFile)
      : missingPet.imageUrl;
    await updateMissingPet(id, {
      missingDate: values.missingDate,
      missingAddress: values.missingAddress.trim(),
      detail: values.detail.trim(),
      imageUrl,
      latitude: optionalCoordinate(values.latitude),
      longitude: optionalCoordinate(values.longitude),
    });
    void navigate(`/missing-pets/${id}`, { replace: true });
  };

  return (
    <section className="rounded-xl border-2 border-neutral-900 bg-white p-6">
      <h1 className="text-2xl font-semibold tracking-tight">실종동물 신고 수정</h1>
      <p className="mt-1 text-sm text-neutral-500">
        변경된 실종 정보와 위치를 반영해 주세요.
      </p>
      <MissingPetForm
        initialValues={initialValues}
        existingImageUrl={missingPet.imageUrl}
        submitLabel="수정 완료하기"
        cancelTo={`/missing-pets/${id}`}
        showCoordinateInputs={false}
        onSubmit={submit}
      />
    </section>
  );
}
