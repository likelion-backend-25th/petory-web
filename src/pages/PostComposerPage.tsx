import { useEffect, useRef, useState, type ChangeEvent, type CompositionEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { z } from "zod";
import { isUploadableImage, uploadImage } from "@/api/files";
import { createQna, getQna, updateQna } from "@/api/qna";
import { createPost, getPost, updatePost } from "@/api/posts";
import { PostImagePicker } from "@/components/PostImagePicker";
import type { PostBoard } from "@/hooks/usePostFeed";
import { cn } from "@/lib/cn";
import { prefixHashtags } from "@/lib/postFormat";
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
  board?: PostBoard;
}

export function PostComposerPage({ mode, board = "feed" }: PostComposerPageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { postId } = useParams();
  const writingQna = mode === "edit" ? board === "qna" : searchParams.get("board") === "qna";
  const myId = useAuthStore((state) => state.user?.id ?? null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const previewsRef = useRef(previews);
  previewsRef.current = previews;
  const hashtagComposing = useRef(false);
  const hashtagInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
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
        const post = await (writingQna ? getQna(id, controller.signal) : getPost(id, controller.signal));
        if (myId !== null && myId !== post.memberId) {
          setSubmitError("내 게시글만 수정할 수 있습니다.");
          return;
        }
        reset({
          title: "",
          content: post.content,
          hashtags: prefixHashtags(post.hashtags).trim(),
          isSubscriberOnly: post.isSubscriberOnly === 1,
        });
      } catch (error: unknown) {
        setSubmitError(error instanceof Error ? error.message : "알 수 없는 오류");
      }
    };
    void load();
    return () => controller.abort();
  }, [mode, myId, postId, reset, writingQna]);

  const onFiles = (selected: FileList | null): void => {
    if (selected === null || selected.length === 0 || mode === "edit") {
      return;
    }
    for (const url of previewsRef.current) {
      URL.revokeObjectURL(url);
    }
    const next = Array.from(selected);
    const rejected = next.filter((file) => !isUploadableImage(file));
    setSubmitError(rejected.length > 0 ? "JPG, PNG, WEBP, GIF 이미지만 올릴 수 있습니다." : null);
    const accepted = next.filter((file) => isUploadableImage(file));
    setFiles(accepted);
    setPreviews(accepted.map((file) => URL.createObjectURL(file)));
  };

  const removeFile = (index: number): void => {
    const url = previewsRef.current[index];
    if (url !== undefined) {
      URL.revokeObjectURL(url);
    }
    setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index));
    setPreviews((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const onSubmit = async (values: ComposerValues): Promise<void> => {
    setSubmitError(null);
    const content = values.title.trim() === "" ? values.content : `${values.title.trim()}\n\n${values.content}`;
    const payload = {
      content,
      hashtags: prefixHashtags(values.hashtags).trim(),
      isSubscriberOnly: writingQna || !values.isSubscriberOnly ? 0 : 1,
    };
    try {
      const withImages = async (): Promise<typeof payload & { imageUrls?: string[] }> => {
        if (mode === "edit") {
          return payload;
        }
        const imageUrls: string[] = [];
        for (const file of files) {
          imageUrls.push(await uploadImage(file));
        }
        return imageUrls.length > 0 ? { ...payload, imageUrls } : payload;
      };
      if (writingQna) {
        if (mode === "edit" && postId !== undefined) {
          await updateQna(Number(postId), payload);
          void navigate(`/qna/${postId}`, { replace: true });
          return;
        }
        const created = await createQna(await withImages());
        void navigate(`/qna/${created.id}`, { replace: true });
        return;
      }
      if (mode === "edit" && postId !== undefined) {
        await updatePost(Number(postId), payload);
        void navigate(`/posts/${postId}`, { replace: true });
        return;
      }
      const created = await createPost(await withImages());
      void navigate(`/posts/${created.id}`, { replace: true });
    } catch (error: unknown) {
      setSubmitError(error instanceof Error ? error.message : "알 수 없는 오류");
    }
  };

  const hashtagField = register("hashtags");

  return (
    <section className="space-y-4">
      {mode === "create" ? (
        <div className="grid grid-cols-2 overflow-hidden rounded-xl border-2 border-neutral-900">
          <Link
            to="/posts/new"
            className={cn(
              "flex h-12 items-center justify-center text-sm font-semibold",
              writingQna ? "bg-white hover:bg-neutral-50" : "bg-neutral-900 text-white",
            )}
          >
            메인 피드 작성
          </Link>
          <Link
            to="/posts/new?board=qna"
            className={cn(
              "flex h-12 items-center justify-center border-l-2 border-neutral-900 text-sm font-semibold",
              writingQna ? "bg-neutral-900 text-white" : "bg-white hover:bg-neutral-50",
            )}
          >
            QNA 작성
          </Link>
        </div>
      ) : null}
    <section className="rounded-xl border-2 border-neutral-900 bg-white p-6">
      <h1 className="text-xl font-semibold">{writingQna ? "Q&A 작성" : "내 반려동물 자랑하기"}</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {writingQna ? "궁금한 점을 남겨 주세요." : "나의 반려동물을 자랑해주세요...등등안내"}
      </p>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        {writingQna ? null : (
          <label className="flex items-center justify-end gap-2 text-sm">
            구독자 전용 게시물
            <input type="checkbox" className="accent-neutral-900" {...register("isSubscriberOnly")} />
          </label>
        )}
        <input
          placeholder="큰 제목"
          className="h-10 w-full rounded-md border-2 border-neutral-900 px-3 text-sm outline-none"
          {...register("title")}
        />
        <input
          placeholder="태그(ex) #고양이 #강아지 #사랑 #펫토리그램으로 #좋아요완료)"
          className="h-10 w-full rounded-md border-2 border-neutral-900 px-3 text-sm outline-none"
          name={hashtagField.name}
          ref={(element) => {
            hashtagInputRef.current = element;
            hashtagField.ref(element);
          }}
          onCompositionStart={() => {
            hashtagComposing.current = true;
          }}
          onCompositionEnd={(event: CompositionEvent<HTMLInputElement>) => {
            hashtagComposing.current = false;
            setValue("hashtags", prefixHashtags(event.currentTarget.value), { shouldDirty: true });
          }}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            if (hashtagComposing.current) {
              return;
            }
            const next = prefixHashtags(event.target.value);
            setValue("hashtags", next, { shouldDirty: true });
            if ((event.target.selectionStart ?? 0) < event.target.value.length) {
              return;
            }
            requestAnimationFrame(() => {
              const input = hashtagInputRef.current;
              if (input === null) {
                return;
              }
              input.setSelectionRange(next.length, next.length);
            });
          }}
          onBlur={(event) => {
            setValue("hashtags", prefixHashtags(event.target.value).trim(), { shouldDirty: true });
            hashtagField.onBlur(event);
          }}
        />
        <textarea
          placeholder="내용"
          rows={6}
          className="w-full rounded-md border-2 border-neutral-900 px-3 py-2 text-sm outline-none"
          {...register("content")}
        />
        {errors.content ? <p className="text-xs text-red-600">{errors.content.message}</p> : null}
        <PostImagePicker
          mode={mode}
          previews={previews}
          disabled={isSubmitting}
          onFiles={onFiles}
          onRemove={removeFile}
        />
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
            {isSubmitting ? "등록 중..." : mode === "edit" ? "수정하기" : "등록하기"}
          </button>
        </div>
      </form>
    </section>
    </section>
  );
}
