import { useState, useEffect, useCallback, useRef } from "react";
import apiClient from "../api/apiClient";

type DropdownItem = { id: string; value: string; label: string };

export const useDropdownData = (endpoints: Record<string, string>) => {
  const stableEndpoints = useRef(endpoints);
  const endpointsString = JSON.stringify(endpoints);
  const lastEndpointsString = useRef(endpointsString);

  if (endpointsString !== lastEndpointsString.current) {
    stableEndpoints.current = endpoints;
    lastEndpointsString.current = endpointsString;
  }

  const finalEndpoints = stableEndpoints.current;

  const [data, setData] = useState<Record<string, DropdownItem[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const isFetchingRef = useRef(false);

  const fetchData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    const initLoading: Record<string, boolean> = {};
    const initErrors: Record<string, string | null> = {};

    Object.keys(finalEndpoints).forEach((key) => {
      initLoading[key] = true;
      initErrors[key] = null;
    });

    setLoading(initLoading);
    setErrors(initErrors);

    try {
      const results = await Promise.all(
        Object.entries(finalEndpoints).map(async ([key, endpoint]) => {
          try {
            const result = await apiClient<DropdownItem[]>(endpoint, {
              method: "GET",
              headers: {
                Accept: "application/json",
              },
            });

            return [key, result] as [string, DropdownItem[]];
          } catch (err) {
            const message =
              err instanceof Error ? err.message : "Unknown error";

            setErrors((prev) => ({
              ...prev,
              [key]: message,
            }));

            return [key, []] as [string, DropdownItem[]];
          } finally {
            setLoading((prev) => ({ ...prev, [key]: false }));
          }
        })
      );

      setData(Object.fromEntries(results));
    } finally {
      isFetchingRef.current = false;
    }
  }, [finalEndpoints]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    isFetchingRef.current = false;
    fetchData();
  }, [fetchData]);

  return { data, loading, errors, refetch };
};