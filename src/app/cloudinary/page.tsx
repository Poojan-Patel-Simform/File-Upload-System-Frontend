"use client";

import useCloudinaryListPage from "@/hooks/cloudinary/useCloudinaryListPage";
import CloudinaryListView from "@/components/cloudinary/CloudinaryListView";

/** Route "/cloudinary": admin list of Cloudinary assets. */
const CloudinaryPage = () => {
  const {
    take,
    skip,
    setSkip,
    items,
    total,
    isLoading,
    error,
    pendingDeleteLabel,
    isConfirmDeleteOpen,
    requestDelete,
    handleDeleteConfirmed,
    cancelDelete,
    goToDetail,
  } = useCloudinaryListPage();

  return (
    <CloudinaryListView
      items={items}
      total={total}
      take={take}
      skip={skip}
      isLoading={isLoading}
      error={error}
      pendingDeleteLabel={pendingDeleteLabel}
      isConfirmDeleteOpen={isConfirmDeleteOpen}
      onSkipChange={setSkip}
      onRowClick={goToDetail}
      onRequestDelete={requestDelete}
      onConfirmDelete={handleDeleteConfirmed}
      onCancelDelete={cancelDelete}
    />
  );
};

export default CloudinaryPage;
