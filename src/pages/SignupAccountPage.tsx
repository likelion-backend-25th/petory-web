import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";
import { z } from "zod";
import { isEmailTaken } from "@/api/auth";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthField } from "@/components/auth/AuthField";
import { SketchButton } from "@/components/auth/SketchButton";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { startSocialLogin } from "@/lib/socialLogin";
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

interface FieldCheck {
  value: string;
  ok: boolean;
  message: string;
}

interface SignupReturnState {
  email?: string;
  password?: string;
  emailError?: string;
}

function readReturnState(value: unknown): SignupReturnState {
  if (typeof value !== "object" || value === null) {
    return {};
  }
  const record = value as Record<string, unknown>;
  return {
    email: typeof record.email === "string" ? record.email : undefined,
    password: typeof record.password === "string" ? record.password : undefined,
    emailError: typeof record.emailError === "string" ? record.emailError : undefined,
  };
}

export function SignupAccountPage() {
  const navigate = useNavigate();
  const returned = readReturnState(useLocation().state);
  const [emailCheck, setEmailCheck] = useState<FieldCheck | null>(
    returned.emailError && returned.email
      ? { value: returned.email.trim(), ok: false, message: returned.emailError }
      : null,
  );
  const [checkingEmail, setCheckingEmail] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    watch,
    formState: { errors },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      email: returned.email ?? "",
      password: returned.password ?? "",
      passwordConfirm: returned.password ?? "",
    },
  });

  const emailValue = watch("email").trim();
  const shownEmailCheck = emailCheck?.value === emailValue ? emailCheck : null;

  const checkEmail = async (): Promise<void> => {
    const email = getValues("email").trim();
    if (!z.email().safeParse(email).success) {
      setEmailCheck({ value: email, ok: false, message: "이메일 형식을 확인해 주세요." });
      return;
    }

    setCheckingEmail(true);
    try {
      const taken = await isEmailTaken(email);
      if (getValues("email").trim() !== email) {
        return;
      }
      setEmailCheck({
        value: email,
        ok: !taken,
        message: taken ? "이미 사용 중인 아이디입니다." : "사용 가능한 아이디입니다.",
      });
    } catch (error: unknown) {
      if (getValues("email").trim() !== email) {
        return;
      }
      const message = error instanceof Error ? error.message : "중복 확인에 실패했습니다.";
      setEmailCheck({ value: email, ok: false, message });
    } finally {
      setCheckingEmail(false);
    }
  };

  const onSubmit = (values: AccountFormValues): void => {
    const email = values.email.trim();
    if (emailCheck?.ok !== true || emailCheck.value !== email) {
      if (emailCheck?.value !== email) {
        setEmailCheck({ value: email, ok: false, message: "아이디 중복체크를 해 주세요." });
      }
      return;
    }
    const draft: SignupAccountDraft = { email, password: values.password };
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
            actionLabel={checkingEmail ? "확인 중" : "중복체크"}
            actionDisabled={checkingEmail}
            onAction={() => {
              void checkEmail();
            }}
            error={errors.email?.message}
            {...register("email")}
          />
          {shownEmailCheck ? (
            <p className={`text-xs ${shownEmailCheck.ok ? "text-green-700" : "text-red-600"}`}>
              {shownEmailCheck.message}
            </p>
          ) : null}
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
        <SketchButton type="submit" filled className="w-full" disabled={shownEmailCheck?.ok !== true}>
          다음
        </SketchButton>
      </form>
      <SocialAuthButtons
        onGoogle={() => startSocialLogin("google")}
        onKakao={() => startSocialLogin("kakao")}
      />
    </AuthCard>
  );
}
