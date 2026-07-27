"use client";

import useLocalUploadsListPage from "@/hooks/local-uploads/useLocalUploadsListPage";
import LocalUploadsListView from "@/components/local-uploads/LocalUploadsListView";

const LocalUploadsPage = () => {
  const {
    status,
    setStatus,
    take,
    skip,
    setSkip,
    items,
    total,
    isLoading,
    error,
    downloadingId,
    pendingDeleteLabel,
    isConfirmDeleteOpen,
    requestDelete,
    handleDownload,
    handleDeleteConfirmed,
    cancelDelete,
    goToDetail,
  } = useLocalUploadsListPage();

  return (
    <LocalUploadsListView
      status={status}
      items={items}
      total={total}
      take={take}
      skip={skip}
      isLoading={isLoading}
      error={error}
      downloadingId={downloadingId}
      pendingDeleteLabel={pendingDeleteLabel}
      isConfirmDeleteOpen={isConfirmDeleteOpen}
      onStatusChange={setStatus}
      onSkipChange={setSkip}
      onRowClick={goToDetail}
      onDownload={handleDownload}
      onRequestDelete={requestDelete}
      onConfirmDelete={handleDeleteConfirmed}
      onCancelDelete={cancelDelete}
    />
  );
};

export default LocalUploadsPage;
