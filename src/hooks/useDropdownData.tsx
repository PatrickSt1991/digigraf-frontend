import { useState, useEffect, useCallback } from 'react';

type DropdownItem = { id: string; value: string; label: string };

export const useDropdownData = (endpoints: Record<string, string>) => {
  const [data, setData] = useState<Record<string, DropdownItem[]>>(() => {
    const initialData: Record<string, DropdownItem[]> = {};
    Object.keys(endpoints).forEach(key => {
      initialData[key] = [];
    });
    return initialData;
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const promises = Object.entries(endpoints).map(async ([key, endpoint]) => {
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch ${key}: ${response.status} ${response.statusText}`);
        }

        // Check if response is JSON before parsing
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error(`Response from ${key} is not JSON. Content-Type: ${contentType}`);
        }

        try {
          const result = await response.json();
          return [key, result];
        } catch (parseError) {
          throw new Error(`Failed to parse JSON from ${key}: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
        }
      });

      const results = await Promise.all(promises);
      const dataObject = Object.fromEntries(results);
      setData(dataObject);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      
      if (process.env.NODE_ENV === 'production') {
        setError('Failed to load dropdown data. Please try again later.');
      } else {
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, [endpoints]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};