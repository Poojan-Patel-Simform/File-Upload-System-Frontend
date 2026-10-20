"use client";

import UploadPageLayout from "@/components/upload/UploadPageLayout";
import useCloudinaryWorkerPoolUpload from "@/hooks/strategies/cloudinary/useCloudinaryWorkerPoolUpload";

/** Route "/strategies/cloudinary": chunked worker-pool upload to Cloudinary. */
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
  } = useCloudinaryWorkerPoolUpload();

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
