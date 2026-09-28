import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useParams } from "react-router";
import { z } from "zod";
import { createPost, getPost, updatePost } from "@/api/posts";
import { useAuthStore } from "@/stores/useAuthStore";

const composerSchema = z.object({
  title: z.string(),
  content: z.string().min(1, "내용을 입력해 주세요."),
  hashtags: z.string(),
  isSubscriberOnly: z.boolean(),
});

type ComposerValues = z.infer<typeof composerSchema>;

interface PostComposerPageProps {
  mode: "create" | "edit";
}

export function PostComposerPage({ mode }: PostComposerPageProps) {
  const navigate = useNavigate();
  const { postId } = useParams();
  const myId = useAuthStore((state) => state.user?.id ?? null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ComposerValues>({
    resolver: zodResolver(composerSchema),
    defaultValues: { title: "", content: "", hashtags: "", isSubscriberOnly: false },
  });

  useEffect(() => {
    if (mode !== "edit" || postId === undefined || !/^\d+$/.test(postId)) {
      return;
    }
    const id = Number(postId);
    const controller = new AbortController();
    const load = async (): Promise<void> => {
      try {
        const post = await getPost(id, controller.signal);
        if (myId !== null && myId !== post.memberId) {
          setSubmitError("내 게시글만 수정할 수 있습니다.");
          return;
        }
        reset({
          title: "",
          content: post.content,
          hashtags: post.hashtags,
          isSubscriberOnly: post.isSubscriberOnly === 1,
        });
      } catch (error: unknown) {
        setSubmitError(error instanceof Error ? error.message : "알 수 없는 오류");
      }
    };
    void load();
    return () => controller.abort();
  }, [mode, myId, postId, reset]);

  const onFiles = (files: FileList | null): void => {
    if (files === null) {
      return;
    }
    setPreviews(Array.from(files).map((file) => URL.createObjectURL(file)));
  };

  const onSubmit = async (values: ComposerValues): Promise<void> => {
    setSubmitError(null);
    const content = values.title.trim() === "" ? values.content : `${values.title.trim()}\n\n${values.content}`;
    const payload = {
      content,
      hashtags: values.hashtags.trim(),
      isSubscriberOnly: values.isSubscriberOnly ? 1 : 0,
    };
    try {
      if (mode === "edit" && postId !== undefined) {
        await updatePost(Number(postId), payload);
        void navigate(`/posts/${postId}`, { replace: true });
        return;
      }
      const created = await createPost(payload);
      void navigate(`/posts/${created.id}`, { replace: true });
    } catch (error: unknown) {
      setSubmitError(error instanceof Error ? error.message : "알 수 없는 오류");
    }
  };

  return (
    <section className="rounded-xl border-2 border-neutral-900 bg-white p-6">
      <h1 className="text-xl font-semibold">내 반려동물 자랑하기</h1>
      <p className="mt-1 text-sm text-neutral-500">나의 반려동물을 자랑해주세요...등등안내</p>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <label className="flex items-center justify-end gap-2 text-sm">
          구독자 전용 게시물
          <input type="checkbox" className="accent-neutral-900" {...register("isSubscriberOnly")} />
        </label>
        <input
          placeholder="큰 제목"
          className="h-10 w-full rounded-md border-2 border-neutral-900 px-3 text-sm outline-none"
          {...register("title")}
        />
        <input
          placeholder="태그(ex) #고양이 #강아지 #사랑 #펫토리그램으로 #좋아요완료)"
          className="h-10 w-full rounded-md border-2 border-neutral-900 px-3 text-sm outline-none"
          {...register("hashtags")}
        />
        <textarea
          placeholder="내용"
          rows={6}
          className="w-full rounded-md border-2 border-neutral-900 px-3 py-2 text-sm outline-none"
          {...register("content")}
        />
        {errors.content ? <p className="text-xs text-red-600">{errors.content.message}</p> : null}
        <div className="rounded-md border-2 border-dashed border-neutral-900 p-4">
          <p className="mb-2 text-sm">귀여운 나와 반려동물 사진 등록</p>
          <input type="file" accept="image/*" multiple onChange={(event) => onFiles(event.target.files)} />
          {previews.length > 0 ? (
            <ul className="mt-3 grid grid-cols-3 gap-2">
              {previews.map((src) => (
                <li key={src}>
                  <img src={src} alt="" className="aspect-square w-full rounded object-cover" />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-neutral-400">사진은 미리보기만 됩니다. 업로드 API는 아직 없습니다.</p>
          )}
        </div>
        {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}
        <div className="flex justify-end gap-3">
          <Link to="/" className="flex h-10 items-center rounded-md border-2 border-neutral-900 px-4 text-sm">
            취소하기
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-10 rounded-md border-2 border-neutral-900 bg-neutral-900 px-4 text-sm text-white disabled:opacity-50"
          >
            {mode === "edit" ? "수정하기" : "등록하기"}
          </button>
        </div>
      </form>
    </section>
  );
}
