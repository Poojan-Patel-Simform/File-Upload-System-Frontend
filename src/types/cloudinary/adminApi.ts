/** A saved Cloudinary asset as returned by the admin API. */
export type CloudinaryAssetItem = {
  id: string;
  publicId: string;
  fileHash: string;
  url: string;
  createdAt: string;
  updatedAt: string;
};

/** Result of deleting an asset (includes Cloudinary's own result string). */
export type CloudinaryDeleteResult = {
  id: string;
  publicId: string;
  cloudinaryResult: string;
  message: string;
};
