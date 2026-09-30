import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate, useParams } from "react-router";
import { z } from "zod";
import { ProfileEditFields, type ProfileEditFieldsValues } from "@/components/ProfileEditFields";
import { isAllowedProfileImage, ProfileImagePicker } from "@/components/ProfileImagePicker";
import { uploadImage } from "@/api/files";
import { editProfile } from "@/api/profile";
import { useProfile } from "@/hooks/useProfile";
import { useAuthStore } from "@/stores/useAuthStore";

const editSchema = z.object({
  nickname: z.string().min(1, "이름을 입력해 주세요."),
  species: z.string(),
  sex: z.string(),
  birthDate: z.string(),
  intro: z.string(),
  profileImage: z.string(),
  address: z.string(),
});

function toDateInput(value: string | undefined): string {
  if (value === undefined || value === "") {
    return "";
  }
  return value.slice(0, 10);
}

export function ProfileEditPage() {
  const navigate = useNavigate();
  const { memberId } = useParams();
  const myId = useAuthStore((state) => state.user?.id ?? null);
  const { profile, status, errorMessage } = useProfile(memberId);
  const [notice, setNotice] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageBusy, setImageBusy] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileEditFieldsValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      nickname: "",
      species: "",
      sex: "",
      birthDate: "",
      intro: "",
      profileImage: "",
      address: "",
    },
  });

  useEffect(() => {
    if (profile === null) {
      return;
    }
    reset({
      nickname: profile.nickname,
      species: profile.species ?? "",
      sex: profile.sex ?? "",
      birthDate: toDateInput(profile.birthDate),
      intro: profile.intro ?? "",
      profileImage: profile.profileImage ?? "",
      address: profile.address ?? "",
    });
  }, [profile, reset]);

  if (myId !== null && memberId !== undefined && Number(memberId) !== myId) {
    return <Navigate to={`/profile/${memberId}`} replace />;
  }
  if (status === "loading") {
    return <p className="text-neutral-500">프로필을 불러오는 중...</p>;
  }
  if (status === "error" || profile === null) {
    return <p className="text-sm text-red-600">{errorMessage}</p>;
  }

  const save = async (values: ProfileEditFieldsValues, goBack: boolean): Promise<void> => {
    setNotice(null);
    try {
      await editProfile(profile.id, values);
      const session = useAuthStore.getState();
      if (session.user !== null && session.accessToken !== null && session.refreshToken !== null) {
        session.setSession(
          { ...session.user, nickname: values.nickname },
          session.accessToken,
          session.refreshToken,
        );
      }
      if (goBack) {
        void navigate(`/profile/${profile.id}`, { replace: true });
        return;
      }
      setNotice("저장했습니다.");
    } catch (error: unknown) {
      setNotice(error instanceof Error ? error.message : "알 수 없는 오류");
    }
  };

  return (
    <section className="rounded-xl border-2 border-neutral-900 bg-white p-6">
      <h1 className="mb-8 text-2xl font-semibold">프로필 편집하기</h1>
      <form className="space-y-5" onSubmit={handleSubmit((values) => save(values, true))} noValidate>
        <ProfileImagePicker
          nickname={profile.nickname}
          imageUrl={profile.profileImage ?? ""}
          error={imageError}
          onFile={(file) => {
            if (!isAllowedProfileImage(file)) {
              setImageError("PNG 또는 JPG, 5MB 이하만 올릴 수 있습니다.");
              return;
            }
            setImageError(null);
            setImageBusy(true);
            void uploadImage(file)
              .then((fileUrl) => {
                setValue("profileImage", fileUrl, { shouldDirty: true });
              })
              .catch((error: unknown) => {
                setImageError(error instanceof Error ? error.message : "알 수 없는 오류");
              })
              .finally(() => {
                setImageBusy(false);
              });
          }}
        />
        <ProfileEditFields
          register={register}
          control={control}
          errors={errors}
          onSaveField={() => {
            if (imageBusy) {
              return;
            }
            void handleSubmit((values) => save(values, false))();
          }}
        />
        {notice ? <p className="text-sm text-neutral-600">{notice}</p> : null}
        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={isSubmitting || imageBusy}
            className="h-11 rounded-md border-2 border-neutral-900 px-8 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50"
          >
            {imageBusy ? "이미지 업로드 중..." : isSubmitting ? "저장 중..." : "내 프로필 보러가기"}
          </button>
        </div>
      </form>
    </section>
  );
}
