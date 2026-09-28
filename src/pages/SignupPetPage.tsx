import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Navigate, useLocation, useNavigate } from "react-router";
import { z } from "zod";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthField, AuthSelect, AuthTextarea } from "@/components/auth/AuthField";
import { SketchButton } from "@/components/auth/SketchButton";
import { signUpAndSignIn } from "@/lib/session";
import type { SignupAccountDraft } from "@/types/auth";

const SPECIES_OPTIONS = ["개", "고양이", "기타"] as const;
const SEX_OPTIONS = ["수", "암"] as const;

const petSchema = z.object({
  nickname: z.string().min(1, "이름을 입력해 주세요."),
  species: z.string().min(1, "종을 선택해 주세요."),
  sex: z.enum(SEX_OPTIONS, { message: "성별을 선택해 주세요." }),
  birthDate: z.string().min(1, "생일을 입력해 주세요."),
  address: z.string().optional(),
  intro: z.string().optional(),
  isAgreed: z.boolean().refine((value) => value, "개인정보 제3자 제공에 동의해 주세요."),
});

type PetFormValues = z.infer<typeof petSchema>;

function isSignupAccountDraft(value: unknown): value is SignupAccountDraft {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return typeof record.email === "string" && typeof record.password === "string";
}

export function SignupPetPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const draft = isSignupAccountDraft(location.state) ? location.state : null;
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [nicknameCheck, setNicknameCheck] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<PetFormValues>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      nickname: "",
      species: "",
      sex: undefined,
      birthDate: "",
      address: "",
      intro: "",
      isAgreed: false,
    },
  });

  if (draft === null) {
    return <Navigate to="/signup" replace />;
  }

  const checkNickname = (): void => {
    const nickname = getValues("nickname").trim();
    setNicknameCheck(nickname.length > 0 ? "사용 가능한 이름입니다." : "이름을 입력해 주세요.");
  };

  const onSubmit = async (values: PetFormValues): Promise<void> => {
    setSubmitError(null);
    try {
      await signUpAndSignIn({
        email: draft.email,
        password: draft.password,
        nickname: values.nickname.trim(),
        species: values.species,
        sex: values.sex,
        birthDate: values.birthDate,
        intro: values.intro?.trim() ?? "",
        address: values.address?.trim() ?? "",
        isAgreed: values.isAgreed,
      });
      void navigate("/", { replace: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "알 수 없는 오류";
      setSubmitError(message);
    }
  };

  return (
    <AuthCard title="동물정보 등록" className="max-w-[400px]">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-1">
          <AuthField
            label="이름(닉네임)"
            autoComplete="nickname"
            actionLabel="중복체크"
            onAction={checkNickname}
            error={errors.nickname?.message}
            {...register("nickname")}
          />
          {nicknameCheck ? <p className="text-xs text-neutral-500">{nicknameCheck}</p> : null}
        </div>
        <AuthSelect label="종" error={errors.species?.message} {...register("species")}>
          <option value="">선택</option>
          {SPECIES_OPTIONS.map((species) => (
            <option key={species} value={species}>
              {species}
            </option>
          ))}
        </AuthSelect>
        <div className="grid grid-cols-2 gap-4">
          <fieldset>
            <legend className="mb-1.5 text-sm text-neutral-800">성별</legend>
            <Controller
              name="sex"
              control={control}
              render={({ field }) => (
                <div className="flex gap-4">
                  {SEX_OPTIONS.map((sex) => (
                    <label key={sex} className="flex items-center gap-1.5 text-sm">
                      <input
                        type="radio"
                        name={field.name}
                        value={sex}
                        checked={field.value === sex}
                        onChange={() => field.onChange(sex)}
                        className="accent-neutral-900"
                      />
                      {sex}
                    </label>
                  ))}
                </div>
              )}
            />
            {errors.sex ? <p className="mt-1 text-xs text-red-600">{errors.sex.message}</p> : null}
          </fieldset>
          <AuthField label="생일" type="date" error={errors.birthDate?.message} {...register("birthDate")} />
        </div>
        <AuthField label="주소" autoComplete="street-address" error={errors.address?.message} {...register("address")} />
        <AuthTextarea label="한줄 소개" rows={3} error={errors.intro?.message} {...register("intro")} />
        <label className="flex items-start gap-2 text-xs text-neutral-700">
          <input type="checkbox" className="mt-0.5 accent-neutral-900" {...register("isAgreed")} />
          개인정보 제3자 제공에 동의합니다.
        </label>
        {errors.isAgreed ? <p className="text-xs text-red-600">{errors.isAgreed.message}</p> : null}
        {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}
        <SketchButton type="submit" filled className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "가입 중..." : "펫토리 시작하기"}
        </SketchButton>
      </form>
    </AuthCard>
  );
}
