import { Outlet } from "react-router";
import { AppFooter } from "@/components/AppFooter";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";

export function RootLayout() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="flex">
        <AppSidebar />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <Header />
          <MobileNav />
          <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
            <Outlet />
          </main>
          <AppFooter />
        </div>
      </div>
    </div>
  );
}
