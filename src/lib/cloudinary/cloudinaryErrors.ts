/** Thrown when Cloudinary no longer recognises the upload session; retrying is pointless. */
export class CloudinarySessionExpiredError extends Error {
  // Marker read by withRetry to stop retrying immediately.
  readonly nonRetryable = true as const;

  constructor() {
    super("Cloudinary upload session expired");
    this.name = "CloudinarySessionExpiredError";
  }
}
