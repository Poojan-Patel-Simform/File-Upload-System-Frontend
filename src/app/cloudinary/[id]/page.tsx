"use client";

import { useParams } from "next/navigation";
import useCloudinaryDetail from "@/hooks/cloudinary/useCloudinaryDetail";
import CloudinaryDetailView from "@/components/cloudinary/CloudinaryDetailView";

const CloudinaryDetailPage = () => {
  const params = useParams<{ id: string }>();
  const assetId = params.id;

  const {
    asset,
    isLoading,
    notFound,
    confirmDelete,
    setConfirmDelete,
    handleDeleteConfirmed,
    goBack,
  } = useCloudinaryDetail(assetId);

  return (
    <CloudinaryDetailView
      asset={asset}
      isLoading={isLoading}
      notFound={notFound}
      confirmDelete={confirmDelete}
      onBack={goBack}
      onRequestDelete={() => setConfirmDelete(true)}
      onConfirmDelete={handleDeleteConfirmed}
      onCancelDelete={() => setConfirmDelete(false)}
    />
  );
};

export default CloudinaryDetailPage;
