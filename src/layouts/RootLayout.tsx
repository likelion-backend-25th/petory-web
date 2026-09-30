import { useState } from "react";
import { Outlet } from "react-router";
import { AppFooter } from "@/components/AppFooter";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { socialCallback } from "@/lib/socialLogin";

export function RootLayout() {
  const [socialError, setSocialError] = useState(socialCallback.kind === "error");

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="flex">
        <AppSidebar />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <Header />
          <MobileNav />
          <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
            {socialError ? (
              <p className="mb-4 flex items-center justify-between gap-3 rounded-md border-2 border-red-600 bg-white px-3 py-2 text-sm text-red-600">
                소셜 로그인에 실패했습니다.
                <button type="button" className="underline" onClick={() => setSocialError(false)}>
                  닫기
                </button>
              </p>
            ) : null}
            <Outlet />
          </main>
          <AppFooter />
        </div>
      </div>
    </div>
  );
}
