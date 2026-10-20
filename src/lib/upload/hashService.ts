/** Returns the SHA-256 digest of a Blob as a lowercase hex string (reads the whole blob into memory). */
export const sha256Hex = async (data: Blob): Promise<string> => {
  const buffer = await data.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};
