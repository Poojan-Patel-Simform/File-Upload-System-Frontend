export type CloudinaryAssetItem = {
  id: string;
  publicId: string;
  fileHash: string;
  url: string;
  createdAt: string;
  updatedAt: string;
};

export type CloudinaryDeleteResult = {
  id: string;
  publicId: string;
  cloudinaryResult: string;
  message: string;
};
