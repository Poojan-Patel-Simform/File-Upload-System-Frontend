"use client";

import Dropzone from "@/components/upload/Dropzone";
import UploadFileListItem from "@/components/upload/UploadFileListItem";
import { UploadFileItem } from "@/types/upload/file";

type PropsType = {
  files: UploadFileItem[];
  onAddFiles: (files: File[]) => void;
  onRetry: (id: string) => void;
  onCancel: (id: string) => void;
  onRemove?: (id: string) => void;
  onPause?: (id: string) => void;
  onResume?: (id: string) => void;
  onResumeDetected?: (id: string) => void;
  onStartFresh?: (id: string) => void;
};

const UploadPageLayout = ({
  files,
  onAddFiles,
  onRetry,
  onCancel,
  onRemove,
  onPause,
  onResume,
  onResumeDetected,
  onStartFresh,
}: PropsType) => {
  return (
    <div className="flex flex-col gap-6 px-5">
      <div className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/3 p-6 shadow-2xl shadow-black/20 backdrop-blur-sm">
        <Dropzone onAddFiles={onAddFiles} />
      </div>

      {files.length > 0 && (
        <div className="flex flex-col gap-4">
          {files.map((item) => (
            <UploadFileListItem
              key={item.id}
              item={item}
              onRetry={onRetry}
              onPause={onPause}
              onResume={onResume}
              onCancel={onCancel}
              onRemove={onRemove}
              onResumeDetected={onResumeDetected}
              onStartFresh={onStartFresh}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadPageLayout;
