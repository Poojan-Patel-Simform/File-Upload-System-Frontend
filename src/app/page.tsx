"use client";

import UploadPageLayout from "@/components/upload/UploadPageLayout";

import useFileUploadTraditional from "@/hooks/upload/useFileUploadTraditional";

const Home = () => {
  const {
    files,
    handleAddFiles,
    handleUpload,
    handleCancel,
    handleRemoveFile,
  } = useFileUploadTraditional();

  return (
    <UploadPageLayout
      files={files}
      onAddFiles={handleAddFiles}
      onRetry={handleUpload}
      onCancel={handleCancel}
      onRemove={handleRemoveFile}
    />
  );
};

export default Home;
