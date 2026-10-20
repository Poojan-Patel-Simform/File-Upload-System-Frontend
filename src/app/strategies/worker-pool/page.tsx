"use client";

import UploadPageLayout from "@/components/upload/UploadPageLayout";
import useFileUploadChunkedWorkerPool from "@/hooks/strategies/worker-pool/useFileUploadChunkedWorkerPool";

/** Route "/strategies/worker-pool": chunked upload sending chunks in parallel via a worker pool. */
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
  } = useFileUploadChunkedWorkerPool();

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
