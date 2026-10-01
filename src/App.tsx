import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import { AdminRoute } from "@/components/AdminRoute";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthLayout } from "@/layouts/AuthLayout";
import { RootLayout } from "@/layouts/RootLayout";
import { ClubPage, PaymentHistoryPage, SubscriptionPage } from "@/pages/ComingSoonPage";
import { AdminPage } from "@/pages/AdminPage";
import { SubscribePage } from "@/pages/SubscribePage";
import { FeedPage } from "@/pages/FeedPage";
import { FollowListPage } from "@/pages/FollowListPage";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage";
import { LoginPage } from "@/pages/LoginPage";
import { MissingPetCreatePage } from "@/pages/MissingPetCreatePage";
import { MissingPetDetailPage } from "@/pages/MissingPetDetailPage";
import { MissingPetEditPage } from "@/pages/MissingPetEditPage";
import { MissingPetListPage } from "@/pages/MissingPetListPage";
import { MyPageRedirect } from "@/pages/MyPageRedirect";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { PaymentReturnPage } from "@/pages/PaymentReturnPage";
import { QnaPage } from "@/pages/QnaPage";
import { RankingPage } from "@/pages/RankingPage";
import { PostComposerPage } from "@/pages/PostComposerPage";
import { PostDetailPage } from "@/pages/PostDetailPage";
import { ProfileEditPage } from "@/pages/ProfileEditPage";
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
      {
        path: "qna",
        element: (
          <ProtectedRoute>
            <QnaPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "qna/:postId/edit",
        element: (
          <ProtectedRoute>
            <PostComposerPage mode="edit" board="qna" />
          </ProtectedRoute>
        ),
      },
      {
        path: "qna/:postId",
        element: (
          <ProtectedRoute>
            <PostDetailPage board="qna" />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin",
        element: (
          <ProtectedRoute>
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: "mypage",
        element: (
          <ProtectedRoute>
            <MyPageRedirect />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile/:memberId/edit",
        element: (
          <ProtectedRoute>
            <ProfileEditPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile/:memberId/followers",
        element: (
          <ProtectedRoute>
            <FollowListPage kind="followers" />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile/:memberId/followings",
        element: (
          <ProtectedRoute>
            <FollowListPage kind="followings" />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile/:memberId/subscribe",
        element: (
          <ProtectedRoute>
            <SubscribePage />
          </ProtectedRoute>
        ),
      },
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
        path: "missing-pets",
        element: (
          <ProtectedRoute>
            <MissingPetListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "missing-pets/new",
        element: (
          <ProtectedRoute>
            <MissingPetCreatePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "missing-pets/:missingPetId/edit",
        element: (
          <ProtectedRoute>
            <MissingPetEditPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "missing-pets/:missingPetId",
        element: (
          <ProtectedRoute>
            <MissingPetDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile/:memberId",
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "payments/history",
        element: (
          <ProtectedRoute>
            <PaymentHistoryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "subscriptions",
        element: (
          <ProtectedRoute>
            <SubscriptionPage />
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
