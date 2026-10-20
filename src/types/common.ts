/** Page of results returned by list endpoints. */
export type PaginatedResult<T> = {
  items: T[];
  total: number;
  take: number;
  skip: number;
};

/** Backend response wrapper: either `data` on success or an error message. */
export type ApiEnvelope<T> =
  | { success: true; data: T }
  | { success: false; message: string; error: string };
