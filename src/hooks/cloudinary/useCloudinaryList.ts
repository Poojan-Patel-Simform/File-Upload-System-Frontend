"use client";

import { useCallback, useEffect, useState } from "react";
import { listCloudinaryAssets } from "@/api/cloudinary/cloudinaryAdminApi";
import { CloudinaryAssetItem } from "@/types/cloudinary/adminApi";

/** Page size. */
const TAKE = 20;

/** Fetches the paginated list of saved Cloudinary assets. */
const useCloudinaryList = () => {
  const [skip, setSkip] = useState(0);
  const [items, setItems] = useState<CloudinaryAssetItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setErrorMessage] = useState<string | null>(null);

  const fetchAssets = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await listCloudinaryAssets({ take: TAKE, skip });
      setItems(result.items);
      setTotal(result.total);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to load Cloudinary assets",
      );
    } finally {
      setIsLoading(false);
    }
  }, [skip]);

  useEffect(() => {
    // Data fetching on mount/dependency-change is an intentional effect;
    // this rule expects state to be set only from external-event callbacks,
    // which doesn't map onto a plain fetch-on-mount hook.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAssets();
  }, [fetchAssets]);

  return {
    take: TAKE,
    skip,
    setSkip,
    items,
    total,
    isLoading,
    error,
    refetch: fetchAssets,
  };
};

export default useCloudinaryList;
