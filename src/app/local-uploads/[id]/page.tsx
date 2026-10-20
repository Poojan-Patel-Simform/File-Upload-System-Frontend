"use client";

import { useParams } from "next/navigation";
import useLocalUploadDetail from "@/hooks/local-uploads/useLocalUploadDetail";
import LocalUploadDetailView from "@/components/local-uploads/LocalUploadDetailView";

/** Route "/local-uploads/[id]": detail view for one local upload. */
const LocalUploadDetailPage = () => {
  const params = useParams<{ id: string }>();
  const uploadId = params.id;

  const {
    upload,
    isLoading,
    notFound,
    isDownloading,
    confirmDelete,
    setConfirmDelete,
    handleDownload,
    handleDeleteConfirmed,
    goBack,
  } = useLocalUploadDetail(uploadId);

  return (
    <LocalUploadDetailView
      upload={upload}
      isLoading={isLoading}
      notFound={notFound}
      isDownloading={isDownloading}
      confirmDelete={confirmDelete}
      onBack={goBack}
      onDownload={handleDownload}
      onRequestDelete={() => setConfirmDelete(true)}
      onConfirmDelete={handleDeleteConfirmed}
      onCancelDelete={() => setConfirmDelete(false)}
    />
  );
};

export default LocalUploadDetailPage;
