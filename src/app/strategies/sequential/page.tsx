"use client";

import UploadPageLayout from "@/components/upload/UploadPageLayout";
import useFileUploadChunkedSequential from "@/hooks/strategies/sequential/useFileUploadChunkedSequential";

/** Route "/strategies/sequential": chunked upload sending one chunk at a time. */
const Home = () => {
  const {
    files,
    handleAddFiles,
    handleUpload,
    handlePause,
    handleResume,
    handleCancel,
    handleRemoveFile,
    handleResumeDetected,
    handleStartFresh,
  } = useFileUploadChunkedSequential();

  return (
    <UploadPageLayout
      files={files}
      onAddFiles={handleAddFiles}
      onRetry={handleUpload}
      onPause={handlePause}
      onResume={handleResume}
      onCancel={handleCancel}
      onRemove={handleRemoveFile}
      onResumeDetected={handleResumeDetected}
      onStartFresh={handleStartFresh}
    />
  );
};

export default Home;
