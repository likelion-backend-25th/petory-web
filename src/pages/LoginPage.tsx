import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router";
import { z } from "zod";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthField } from "@/components/auth/AuthField";
import { BrandLogo } from "@/components/auth/BrandLogo";
import { SketchButton } from "@/components/auth/SketchButton";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { signIn } from "@/lib/session";
import { startSocialLogin } from "@/lib/socialLogin";

const loginSchema = z.object({
  email: z.email("이메일 형식이 아닙니다."),
  password: z.string().min(1, "비밀번호를 입력해 주세요."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginLocationState {
  from?: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues): Promise<void> => {
    setSubmitError(null);
    try {
      await signIn(values);
      const from = (location.state as LoginLocationState | null)?.from ?? "/";
      void navigate(from, { replace: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "알 수 없는 오류";
      setSubmitError(message);
    }
  };

  return (
    <AuthCard>
      <BrandLogo />
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <AuthField
          label="아이디"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <AuthField
          label="비밀번호"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
        {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}
        <SketchButton type="submit" filled className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "로그인 중..." : "로그인"}
        </SketchButton>
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/signup"
            className="flex h-9 items-center justify-center rounded-md border-2 border-neutral-900 text-sm hover:bg-neutral-50"
          >
            회원가입 하기
          </Link>
          <Link
            to="/forgot-password"
            className="flex h-9 items-center justify-center rounded-md border-2 border-neutral-900 text-sm hover:bg-neutral-50"
          >
            비밀번호 찾기
          </Link>
        </div>
      </form>
      <SocialAuthButtons
        onGoogle={() => startSocialLogin("google")}
        onKakao={() => startSocialLogin("kakao")}
      />
    </AuthCard>
  );
}
