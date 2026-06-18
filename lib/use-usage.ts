"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "profit-os-usage";
const FREE_LIMIT = 70;

interface UsageData {
  count: number;
  lastReset: string;
}

export function useUsage() {
  const [usage, setUsage] = useState<UsageData>({ count: 0, lastReset: new Date().toISOString() });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored) as UsageData;
        setUsage(data);
      } catch {
        // Invalid data, reset
        const fresh = { count: 0, lastReset: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
        setUsage(fresh);
      }
    }
    setIsLoaded(true);
  }, []);

  const increment = useCallback(() => {
    setUsage((prev) => {
      const newData = { ...prev, count: prev.count + 1 };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      return newData;
    });
  }, []);

  const remaining = Math.max(0, FREE_LIMIT - usage.count);
  const isLocked = usage.count >= FREE_LIMIT;

  return {
    count: usage.count,
    remaining,
    isLocked,
    isLoaded,
    increment,
    limit: FREE_LIMIT,
  };
}
