import { useNavigate } from "react-router";
import { createMissingPet, uploadMissingPetImage } from "@/api/missingPet";
import {
  MissingPetForm,
  type MissingPetFormValues,
} from "@/components/missingPet/MissingPetForm";

function today(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const initialValues: MissingPetFormValues = {
  missingDate: today(),
  missingAddress: "",
  detail: "",
  latitude: "",
  longitude: "",
};

function optionalCoordinate(value: string): number | undefined {
  return value.trim() === "" ? undefined : Number(value);
}

export function MissingPetCreatePage() {
  const navigate = useNavigate();

  const submit = async (
    values: MissingPetFormValues,
    imageFile: File | null,
  ): Promise<void> => {
    const imageUrl = imageFile
      ? await uploadMissingPetImage(imageFile)
      : undefined;
    const id = await createMissingPet({
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
      <h1 className="text-2xl font-semibold tracking-tight">실종동물 신고 등록</h1>
      <p className="mt-1 text-sm text-neutral-500">
        마지막으로 확인한 장소와 동물의 특징을 자세히 알려주세요.
      </p>
      <MissingPetForm
        initialValues={initialValues}
        submitLabel="신고 등록하기"
        cancelTo="/missing-pets"
        showCoordinateInputs={false}
        onSubmit={submit}
      />
    </section>
  );
}
