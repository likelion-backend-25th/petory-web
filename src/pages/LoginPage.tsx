import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { signIn } from "@/lib/session";

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
    <section className="mx-auto w-full max-w-sm space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">로그인</h1>
        <p className="text-sm text-neutral-500">간식쏘기는 로그인한 회원만 이용할 수 있습니다.</p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input label="이메일" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
        <Input
          label="비밀번호"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
        {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "로그인 중..." : "로그인"}
        </Button>
      </form>
      <Link to="/" className="block text-center text-sm text-neutral-500 underline">
        피드로 돌아가기
      </Link>
    </section>
  );
}
