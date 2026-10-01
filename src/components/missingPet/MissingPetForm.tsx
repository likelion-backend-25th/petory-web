import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Link } from "react-router";
import { z } from "zod";
import { KakaoMapPicker } from "@/components/KakaoMapPicker";

const coordinateSchema = z
  .string()
  .refine(
    (value) => value.trim() === "" || Number.isFinite(Number(value)),
    "숫자로 입력해 주세요.",
  );

const missingPetFormSchema = z
  .object({
    missingDate: z.string().min(1, "실종 날짜를 입력해 주세요."),
    missingAddress: z.string().trim().min(1, "실종 장소를 입력해 주세요."),
    detail: z.string().trim().min(1, "상세 설명을 입력해 주세요."),
    latitude: coordinateSchema.refine(
      (value) =>
        value.trim() === "" ||
        (Number(value) >= -90 && Number(value) <= 90),
      "위도는 -90에서 90 사이여야 합니다.",
    ),
    longitude: coordinateSchema.refine(
      (value) =>
        value.trim() === "" ||
        (Number(value) >= -180 && Number(value) <= 180),
      "경도는 -180에서 180 사이여야 합니다.",
    ),
  })
  .superRefine((values, context) => {
    const hasLatitude = values.latitude.trim() !== "";
    const hasLongitude = values.longitude.trim() !== "";
    if (hasLatitude === hasLongitude) {
      return;
    }
    context.addIssue({
      code: "custom",
      path: [hasLatitude ? "longitude" : "latitude"],
      message: "위도와 경도를 함께 입력해 주세요.",
    });
  });

export type MissingPetFormValues = z.infer<typeof missingPetFormSchema>;

interface MissingPetFormProps {
  initialValues: MissingPetFormValues;
  existingImageUrl?: string;
  submitLabel: string;
  cancelTo: string;
  showCoordinateInputs?: boolean;
  onSubmit(values: MissingPetFormValues, imageFile: File | null): Promise<void>;
}

function readCoordinate(value: string): number | undefined {
  const trimmed = value.trim();
  return trimmed === "" ? undefined : Number(trimmed);
}

export function MissingPetForm({
  initialValues,
  existingImageUrl,
  submitLabel,
  cancelTo,
  showCoordinateInputs = true,
  onSubmit,
}: MissingPetFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MissingPetFormValues>({
    resolver: zodResolver(missingPetFormSchema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  useEffect(
    () => () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    },
    [],
  );

  const latitude = readCoordinate(
    useWatch({ control, name: "latitude" }) ?? "",
  );
  const longitude = readCoordinate(
    useWatch({ control, name: "longitude" }) ?? "",
  );

  const handleImageChange = (files: FileList | null): void => {
    const file = files?.[0] ?? null;
    setImageError(null);
    if (file && !file.type.startsWith("image/")) {
      setImageError("이미지 파일만 선택할 수 있습니다.");
      return;
    }
    if (file && file.size > 10 * 1024 * 1024) {
      setImageError("이미지는 10MB 이하로 선택해 주세요.");
      return;
    }

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    const nextPreviewUrl = file ? URL.createObjectURL(file) : null;
    previewUrlRef.current = nextPreviewUrl;
    setPreviewUrl(nextPreviewUrl);
    setImageFile(file);
  };

  const submit = async (values: MissingPetFormValues): Promise<void> => {
    setSubmitError(null);
    try {
      await onSubmit(values, imageFile);
    } catch (error: unknown) {
      setSubmitError(
        error instanceof Error ? error.message : "실종 신고 저장에 실패했습니다.",
      );
    }
  };

  return (
    <form className="mt-6 space-y-5" onSubmit={handleSubmit(submit)} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5 text-sm font-medium text-neutral-700">
          실종 날짜
          <input
            type="date"
            className="h-10 w-full rounded-md border-2 border-neutral-900 px-3 outline-none"
            {...register("missingDate")}
          />
          {errors.missingDate ? (
            <span className="block text-xs text-red-600">
              {errors.missingDate.message}
            </span>
          ) : null}
        </label>

        <label className="space-y-1.5 text-sm font-medium text-neutral-700">
          실종 장소
          <input
            placeholder="서울특별시 강남구 테헤란로 123"
            className="h-10 w-full rounded-md border-2 border-neutral-900 px-3 outline-none"
            {...register("missingAddress")}
          />
          {errors.missingAddress ? (
            <span className="block text-xs text-red-600">
              {errors.missingAddress.message}
            </span>
          ) : null}
        </label>
      </div>

      <label className="block space-y-1.5 text-sm font-medium text-neutral-700">
        상세 설명
        <textarea
          rows={6}
          placeholder="동물의 외형, 착용품, 특이사항 등을 자세히 적어 주세요."
          className="w-full rounded-md border-2 border-neutral-900 px-3 py-2 outline-none"
          {...register("detail")}
        />
        {errors.detail ? (
          <span className="block text-xs text-red-600">{errors.detail.message}</span>
        ) : null}
      </label>

      <div className="space-y-2 rounded-md border-2 border-dashed border-neutral-900 p-4">
        <label className="block text-sm font-medium">
          이미지
          <input
            type="file"
            accept="image/*"
            className="mt-2 block w-full text-sm"
            onChange={(event) => handleImageChange(event.target.files)}
          />
        </label>
        {previewUrl || existingImageUrl ? (
          <img
            src={previewUrl ?? existingImageUrl}
            alt="실종 동물 미리보기"
            className="max-h-80 w-full rounded-md object-contain"
          />
        ) : (
          <p className="text-xs text-neutral-500">등록할 이미지를 선택해 주세요.</p>
        )}
        {imageError ? <p className="text-xs text-red-600">{imageError}</p> : null}
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold">실종 위치</h2>
        <KakaoMapPicker
          latitude={latitude}
          longitude={longitude}
          onLocationChange={(nextLatitude, nextLongitude, address) => {
            setValue("latitude", String(nextLatitude), { shouldValidate: true });
            setValue("longitude", String(nextLongitude), { shouldValidate: true });
            if (address) {
              setValue("missingAddress", address, { shouldValidate: true });
            }
          }}
        />
        {showCoordinateInputs ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm font-medium text-neutral-700">
              위도
              <input
                inputMode="decimal"
                placeholder="37.500123"
                className="h-10 w-full rounded-md border-2 border-neutral-900 px-3 outline-none"
                {...register("latitude")}
              />
              {errors.latitude ? (
                <span className="block text-xs text-red-600">
                  {errors.latitude.message}
                </span>
              ) : null}
            </label>
            <label className="space-y-1.5 text-sm font-medium text-neutral-700">
              경도
              <input
                inputMode="decimal"
                placeholder="127.036456"
                className="h-10 w-full rounded-md border-2 border-neutral-900 px-3 outline-none"
                {...register("longitude")}
              />
              {errors.longitude ? (
                <span className="block text-xs text-red-600">
                  {errors.longitude.message}
                </span>
              ) : null}
            </label>
          </div>
        ) : (
          <>
            <input type="hidden" {...register("latitude")} />
            <input type="hidden" {...register("longitude")} />
          </>
        )}
      </div>

      {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}
      <div className="flex justify-end gap-3">
        <Link
          to={cancelTo}
          className="inline-flex h-10 items-center rounded-md border-2 border-neutral-900 px-4 text-sm"
        >
          취소하기
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-10 rounded-md border-2 border-neutral-900 bg-neutral-900 px-4 text-sm text-white disabled:opacity-50"
        >
          {isSubmitting ? "저장 중..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
