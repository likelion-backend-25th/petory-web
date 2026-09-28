import { useRef, useState } from "react";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = "image/png,image/jpeg";

interface ProfileImagePickerProps {
  nickname: string;
  imageUrl: string;
  onFile: (file: File) => void;
  error: string | null;
}

export function ProfileImagePicker({ nickname, imageUrl, onFile, error }: ProfileImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const shown = preview ?? (imageUrl !== "" ? imageUrl : null);

  const onChange = (files: FileList | null): void => {
    const file = files?.[0];
    if (file === undefined) {
      return;
    }
    onFile(file);
    setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="flex flex-wrap items-center gap-6">
      {shown ? (
        <img src={shown} alt="" className="size-28 rounded-full border-2 border-neutral-900 object-cover" />
      ) : (
        <span className="flex size-28 items-center justify-center rounded-full border-2 border-neutral-900 text-4xl">
          {nickname.slice(0, 1) || "P"}
        </span>
      )}
      <div className="space-y-2">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(event) => onChange(event.target.files)}
        />
        <button
          type="button"
          className="rounded-md border-2 border-neutral-900 px-6 py-3 text-sm font-medium hover:bg-neutral-50"
          onClick={() => inputRef.current?.click()}
        >
          대표 이미지 변경
        </button>
        <p className="text-xs text-neutral-500">최대 5MB까지 올릴 수 있습니다 (파일 형식은 PNG,JPG)</p>
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}

export function isAllowedProfileImage(file: File): boolean {
  const typeOk = file.type === "image/png" || file.type === "image/jpeg";
  return typeOk && file.size <= MAX_BYTES;
}
