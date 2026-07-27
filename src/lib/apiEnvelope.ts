type EnvelopeLike<T> = { success: true; data: T } | { success: false; message: string };

export const unwrapEnvelope = <T>(body: EnvelopeLike<T>): T => {
  if (!body.success) throw new Error(body.message);
  return body.data;
};
