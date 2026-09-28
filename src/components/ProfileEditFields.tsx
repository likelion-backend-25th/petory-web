import { Controller, type Control, type UseFormRegister, type FieldErrors } from "react-hook-form";
import { AuthField, AuthTextarea } from "@/components/auth/AuthField";

const SEX_OPTIONS = ["수", "암"] as const;

export interface ProfileEditFieldsValues {
  nickname: string;
  species: string;
  sex: string;
  birthDate: string;
  intro: string;
  profileImage: string;
  address: string;
}

interface ProfileEditFieldsProps {
  register: UseFormRegister<ProfileEditFieldsValues>;
  control: Control<ProfileEditFieldsValues>;
  errors: FieldErrors<ProfileEditFieldsValues>;
  onSaveField: () => void;
}

export function ProfileEditFields({ register, control, errors, onSaveField }: ProfileEditFieldsProps) {
  return (
    <>
      <input type="hidden" {...register("profileImage")} />
      <AuthField
        label="이름(닉네임)"
        actionLabel="편집하기"
        onAction={onSaveField}
        error={errors.nickname?.message}
        {...register("nickname")}
      />
      <AuthField label="종" actionLabel="편집하기" onAction={onSaveField} {...register("species")} />
      <div className="grid grid-cols-2 gap-4">
        <fieldset>
          <legend className="mb-1.5 text-sm">성별</legend>
          <Controller
            name="sex"
            control={control}
            render={({ field }) => (
              <div className="flex gap-4 pt-2">
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
        </fieldset>
        <AuthField label="생일" type="date" {...register("birthDate")} />
      </div>
      <AuthField label="주소" actionLabel="편집하기" onAction={onSaveField} {...register("address")} />
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <AuthTextarea label="한줄 소개" rows={3} {...register("intro")} />
        </div>
        <button
          type="button"
          className="mt-7 h-8 shrink-0 rounded-md border-2 border-neutral-900 px-2.5 text-xs hover:bg-neutral-50"
          onClick={onSaveField}
        >
          편집하기
        </button>
      </div>
    </>
  );
}
