import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RootLayout } from "@/layouts/RootLayout";
import { FeedPage } from "@/pages/FeedPage";
import { LoginPage } from "@/pages/LoginPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { PaymentReturnPage } from "@/pages/PaymentReturnPage";
import { PostDetailPage } from "@/pages/PostDetailPage";
import { ProfilePage } from "@/pages/ProfilePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <FeedPage /> },
      { path: "feed", element: <Navigate to="/" replace /> },
      { path: "login", element: <LoginPage /> },
      { path: "posts/:postId", element: <PostDetailPage /> },
      {
        path: "profile/:memberId",
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "payments/return",
        element: (
          <ProtectedRoute>
            <PaymentReturnPage />
          </ProtectedRoute>
        ),
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
