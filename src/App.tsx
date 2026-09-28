import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthLayout } from "@/layouts/AuthLayout";
import { RootLayout } from "@/layouts/RootLayout";
import { ChatPage, ClubPage, QnaPage, RankingPage } from "@/pages/ComingSoonPage";
import { FeedPage } from "@/pages/FeedPage";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage";
import { LoginPage } from "@/pages/LoginPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { PaymentReturnPage } from "@/pages/PaymentReturnPage";
import { PostComposerPage } from "@/pages/PostComposerPage";
import { PostDetailPage } from "@/pages/PostDetailPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";
import { SignupAccountPage } from "@/pages/SignupAccountPage";
import { SignupPetPage } from "@/pages/SignupPetPage";

const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignupAccountPage /> },
      { path: "signup/pet", element: <SignupPetPage /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      { path: "reset-password", element: <ResetPasswordPage /> },
    ],
  },
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <FeedPage /> },
      { path: "feed", element: <Navigate to="/" replace /> },
      { path: "ranking", element: <RankingPage /> },
      { path: "club", element: <ClubPage /> },
      { path: "qna", element: <QnaPage /> },
      { path: "chat", element: <ChatPage /> },
      {
        path: "posts/new",
        element: (
          <ProtectedRoute>
            <PostComposerPage mode="create" />
          </ProtectedRoute>
        ),
      },
      {
        path: "posts/:postId/edit",
        element: (
          <ProtectedRoute>
            <PostComposerPage mode="edit" />
          </ProtectedRoute>
        ),
      },
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
