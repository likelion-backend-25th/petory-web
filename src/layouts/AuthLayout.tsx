import { Link, Outlet } from "react-router";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-white px-4 py-12">
      <Outlet />
      <Link to="/" className="mt-6 text-sm text-neutral-500 underline">
        피드로 돌아가기
      </Link>
    </div>
  );
}
