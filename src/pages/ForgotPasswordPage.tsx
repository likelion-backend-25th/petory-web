import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { z } from "zod";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthField } from "@/components/auth/AuthField";
import { SketchButton } from "@/components/auth/SketchButton";

const forgotSchema = z.object({
  email: z.email("이메일 형식이 아닙니다."),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (values: ForgotFormValues): void => {
    void navigate("/reset-password", { state: { email: values.email } });
  };

  return (
    <AuthCard title="비밀번호 찾기">
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
        <AuthField
          label="아이디(이메일)"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <SketchButton type="submit" filled className="w-full">
          찾아가기
        </SketchButton>
      </form>
    </AuthCard>
  );
}
