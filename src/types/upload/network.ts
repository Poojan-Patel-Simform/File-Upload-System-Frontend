/** Suggested upload concurrency for the current network. */
export type NetworkHint = {
  concurrency: number;
};

/** Minimal shape of the (non-standard) Network Information API we read. */
export type NetworkInformationLike = {
  effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
};
