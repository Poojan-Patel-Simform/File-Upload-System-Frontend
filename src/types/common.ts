export type PaginatedResult<T> = {
  items: T[];
  total: number;
  take: number;
  skip: number;
};

export type ApiEnvelope<T> =
  | { success: true; data: T }
  | { success: false; message: string; error: string };
