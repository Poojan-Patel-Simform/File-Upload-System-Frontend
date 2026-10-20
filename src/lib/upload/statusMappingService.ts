import { FileUploadingStatusEnum, UploadStatus } from "@/types/upload/file";

/** Maps a server-side upload status to the client status enum; unknown values fall back to IDLE. */
export const mapServerStatusToClientStatus = (
  status: UploadStatus | string,
): FileUploadingStatusEnum => {
  switch (status) {
    case UploadStatus.NEW:
      return FileUploadingStatusEnum.IDLE;
    case UploadStatus.UPLOADING:
      return FileUploadingStatusEnum.UPLOADING;
    case UploadStatus.MERGING:
      return FileUploadingStatusEnum.MERGING;
    case UploadStatus.COMPLETED:
      return FileUploadingStatusEnum.COMPLETED;
    case UploadStatus.FAILED:
      return FileUploadingStatusEnum.ERROR;
    default:
      return FileUploadingStatusEnum.IDLE;
  }
};
