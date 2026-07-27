"use client";

import { useRef, useState } from "react";

import { sha256Hex } from "@/lib/upload/hashService";

/**
 * Computes a file's SHA-256 hash on the main thread.
 *
 * @returns hash - the most recently computed hash, or null if none yet
 * @returns isHashing - true while at least one hash job is in flight
 * @returns handleGetHash - hash a File and resolve with the hex digest
 */
const useHash = () => {
  const [hash, setHash] = useState<string | null>(null);
  const [isHashing, setIsHashing] = useState(false);

  // Counts concurrently in-flight hash jobs. handleGetHash can be called
  // multiple times before earlier calls resolve (e.g. addFiles hashing
  // several dropped files at once), so isHashing must only flip back to
  // false once the LAST job finishes — otherwise one job's completion would
  // prematurely clear the loading flag while others are still running.
  const hashingCountRef = useRef(0);

  const handleGetHash = async (file: File): Promise<string> => {
    hashingCountRef.current += 1;
    setIsHashing(true);

    try {
      const digest = await sha256Hex(file);

      setHash(digest);
      return digest;
    } finally {
      hashingCountRef.current -= 1;
      if (hashingCountRef.current === 0) setIsHashing(false);
    }
  };

  return { hash, isHashing, handleGetHash };
};

export default useHash;
