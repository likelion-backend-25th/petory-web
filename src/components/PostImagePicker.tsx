interface PostImagePickerProps {
  mode: "create" | "edit";
  previews: string[];
  disabled: boolean;
  onFiles: (files: FileList | null) => void;
  onRemove: (index: number) => void;
}

export function PostImagePicker({ mode, previews, disabled, onFiles, onRemove }: PostImagePickerProps) {
  const locked = mode === "edit" || disabled;

  return (
    <div className="rounded-md border-2 border-dashed border-neutral-900 p-4">
      <p className="mb-2 text-sm">귀여운 나와 반려동물 사진 등록</p>
      {mode === "create" ? (
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          disabled={locked}
          onChange={(event) => {
            onFiles(event.target.files);
            event.currentTarget.value = "";
          }}
        />
      ) : null}
      {previews.length > 0 ? (
        <ul className="mt-3 grid grid-cols-3 gap-2">
          {previews.map((src, index) => (
            <li key={src} className="relative">
              <img src={src} alt="" className="aspect-square w-full rounded object-cover" />
              {mode === "create" ? (
                <button
                  type="button"
                  className="absolute top-1 right-1 rounded bg-neutral-900 px-1.5 py-0.5 text-xs text-white"
                  disabled={disabled}
                  onClick={() => onRemove(index)}
                >
                  빼기
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-neutral-400">
          {mode === "edit"
            ? "수정 화면에서는 사진을 바꾸지 않습니다."
            : "JPG, PNG, WEBP, GIF 이미지를 올리면 글과 함께 저장됩니다."}
        </p>
      )}
    </div>
  );
}
