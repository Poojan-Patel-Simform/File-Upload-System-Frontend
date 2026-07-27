"use client";

import { UploadFileItem } from "@/types/upload/file";
import { useState } from "react";

const useUploadFilesState = () => {
  const [files, setFiles] = useState<UploadFileItem[]>([]);

  const updateFile = (id: string, patch: Partial<UploadFileItem>) => {
    setFiles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  };

  const appendLog = (id: string, line: string) => {
    setFiles((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, logs: [...item.logs, line] } : item,
      ),
    );
  };

  return { files, setFiles, updateFile, appendLog };
};

export default useUploadFilesState;
