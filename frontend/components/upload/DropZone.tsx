"use client";

import { Upload, Film, AlertCircle } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface DropZoneProps {
  onFile: (file: File) => void;
  isLoading: boolean;
  error?: string;
}

const ACCEPTED = ["video/mp4", "video/quicktime", "video/webm", "video/x-msvideo"];

export default function DropZone({ onFile, isLoading, error }: DropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!ACCEPTED.includes(file.type)) {
        alert("Please upload an MP4, MOV, or WebM video file.");
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        alert("File is too large. Maximum size is 100MB.");
        return;
      }
      onFile(file);
    },
    [onFile]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div
      className={cn(
        "relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer select-none",
        dragging
          ? "border-violet-400 bg-violet-500/10 drop-zone-active"
          : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]",
        isLoading && "pointer-events-none opacity-60"
      )}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => !isLoading && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm"
        className="hidden"
        onChange={onInputChange}
      />

      <div className="flex flex-col items-center justify-center py-16 px-8 gap-5">
        <div className={cn(
          "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300",
          dragging ? "bg-violet-500/20 scale-110" : "bg-white/5"
        )}>
          {dragging ? (
            <Film className="w-8 h-8 text-violet-400" />
          ) : (
            <Upload className="w-8 h-8 text-white/40" />
          )}
        </div>

        <div className="text-center">
          <p className="text-lg font-medium text-white/90">
            {dragging ? "Drop it here" : "Drop your reel video here"}
          </p>
          <p className="text-sm text-white/40 mt-1">
            or <span className="text-violet-400 underline underline-offset-2">click to browse</span>
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-white/25">
          <span>MP4 · MOV · WebM</span>
          <span>·</span>
          <span>Max 100MB</span>
        </div>
      </div>

      {error && (
        <div className="absolute bottom-0 left-0 right-0 mx-4 mb-4 flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
