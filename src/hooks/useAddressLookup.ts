import { useState, useEffect, useRef } from "react";
import { lookupAddress, AddressLookupResult } from "../utils/lookupAddress";

interface UseAddressLookupOptions {
  postalCode: string;
  houseNumber: string;
  suffix?: string;
  onResult: (result: AddressLookupResult) => void;
}

export const useAddressLookup = ({ postalCode, houseNumber, suffix, onResult }: UseAddressLookupOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useEffect(() => {
    const normalized = postalCode.replace(/\s/g, "").toUpperCase();
    if (!/^\d{4}[A-Z]{2}$/.test(normalized) || !houseNumber.trim()) {
      setLookupError(null);
      return;
    }

    let cancelled = false;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setLookupError(null);

      try {
        const result = await lookupAddress(normalized, houseNumber.trim(), suffix);
        if (cancelled) return;
        if (result) {
          onResultRef.current(result);
        } else {
          setLookupError("Adres niet gevonden");
        }
      } catch {
        if (!cancelled) setLookupError("Fout bij ophalen adresgegevens");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, 600);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [postalCode, houseNumber, suffix]);

  return { isLoading, lookupError };
};
