import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { z } from "zod";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthField } from "@/components/auth/AuthField";
import { SketchButton } from "@/components/auth/SketchButton";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import type { SignupAccountDraft } from "@/types/auth";

const accountSchema = z
  .object({
    email: z.email("이메일 형식이 아닙니다."),
    password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
    passwordConfirm: z.string().min(1, "비밀번호 확인을 입력해 주세요."),
  })
  .refine((values) => values.password === values.passwordConfirm, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["passwordConfirm"],
  });

type AccountFormValues = z.infer<typeof accountSchema>;

const SOCIAL_UNAVAILABLE = "소셜 가입은 아직 연결되지 않았습니다.";

export function SignupAccountPage() {
  const navigate = useNavigate();
  const [emailCheck, setEmailCheck] = useState<string | null>(null);
  const [socialError, setSocialError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: { email: "", password: "", passwordConfirm: "" },
  });

  const checkEmail = (): void => {
    const parsed = z.email().safeParse(getValues("email"));
    setEmailCheck(parsed.success ? "사용 가능한 이메일 형식입니다." : "이메일 형식을 확인해 주세요.");
  };

  const onSubmit = (values: AccountFormValues): void => {
    const draft: SignupAccountDraft = { email: values.email, password: values.password };
    void navigate("/signup/pet", { state: draft });
  };

  return (
    <AuthCard title="가입정보 등록">
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-1">
          <AuthField
            label="아이디(이메일)"
            type="email"
            autoComplete="email"
            actionLabel="중복체크"
            onAction={checkEmail}
            error={errors.email?.message}
            {...register("email")}
          />
          {emailCheck ? <p className="text-xs text-neutral-500">{emailCheck}</p> : null}
        </div>
        <AuthField
          label="비밀번호"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <AuthField
          label="비밀번호 확인"
          type="password"
          autoComplete="new-password"
          error={errors.passwordConfirm?.message}
          {...register("passwordConfirm")}
        />
        {socialError ? <p className="text-sm text-red-600">{socialError}</p> : null}
        <SketchButton type="submit" filled className="w-full">
          다음
        </SketchButton>
      </form>
      <SocialAuthButtons
        onGoogle={() => setSocialError(SOCIAL_UNAVAILABLE)}
        onKakao={() => setSocialError(SOCIAL_UNAVAILABLE)}
      />
    </AuthCard>
  );
}
