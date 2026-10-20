"use client";

import { UploadFileItem } from "@/types/upload/file";
import { useState } from "react";

/**
 * Holds the upload list state shared by all upload hooks.
 *
 * @returns updateFile - shallow-merge a patch into one item
 * @returns appendLog - add a log line to one item
 */
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
