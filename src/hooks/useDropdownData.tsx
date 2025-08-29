import { useState, useEffect, useCallback, useRef } from "react";

type DropdownItem = { id: string; value: string; label: string };

export const useDropdownData = (endpoints: Record<string, string>) => {
  const stableEndpoints = useRef(endpoints);
  const endpointsString = JSON.stringify(endpoints);
  const lastEndpointsString = useRef(endpointsString);

  // Prevents ref changes on every render
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

    // Initialize states per endpoint
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
            const response = await fetch(endpoint, {
              method: "GET",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
              credentials: "same-origin",
            });

            if (!response.ok) {
              const responseText = await response.text();
              throw new Error(
                `Failed to fetch ${key}: ${response.status} ${response.statusText}. Response: ${responseText.substring(0, 200)}`
              );
            }

            const contentType = response.headers.get("content-type");
            if (!contentType?.includes("application/json")) {
              const responseText = await response.text();
              throw new Error(
                `Response from ${key} is not JSON. Content-Type: ${contentType}. Response: ${responseText.substring(0, 200)}`
              );
            }

            const result: DropdownItem[] = await response.json();
            return [key, result] as [string, DropdownItem[]];
          } catch (err) {
            setErrors((prev) => ({
              ...prev,
              [key]: err instanceof Error ? err.message : "Unknown error",
            }));
            return [key, []] as [string, DropdownItem[]]; // fallback
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