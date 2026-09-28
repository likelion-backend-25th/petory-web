import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { z } from "zod";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthField } from "@/components/auth/AuthField";
import { SketchButton } from "@/components/auth/SketchButton";

const resetSchema = z
  .object({
    password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
    passwordConfirm: z.string().min(1, "비밀번호 확인을 입력해 주세요."),
  })
  .refine((values) => values.password === values.passwordConfirm, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["passwordConfirm"],
  });

type ResetFormValues = z.infer<typeof resetSchema>;

export function ResetPasswordPage() {
  const [notice, setNotice] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", passwordConfirm: "" },
  });

  const onSubmit = (): void => {
    setNotice("비밀번호 재설정 API가 아직 없습니다. 로그인 화면에서 기존 비밀번호로 들어가 주세요.");
  };

  return (
    <AuthCard title="비밀번호 재설정">
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <AuthField
          label="새로운 비밀번호"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <AuthField
          label="새로운 비밀번호 확인"
          type="password"
          autoComplete="new-password"
          error={errors.passwordConfirm?.message}
          {...register("passwordConfirm")}
        />
        {notice ? <p className="text-sm text-neutral-600">{notice}</p> : null}
        <SketchButton type="submit" filled className="w-full">
          재설정하기
        </SketchButton>
      </form>
      <Link to="/login" className="mt-5 block text-center text-sm text-neutral-500 underline">
        로그인으로 돌아가기
      </Link>
    </AuthCard>
  );
}
