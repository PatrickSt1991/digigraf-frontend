import { useState, useEffect, useCallback, useRef } from 'react';

type DropdownItem = { id: string; value: string; label: string };

export const useDropdownData = (endpoints: Record<string, string>) => {
  // Use refs to maintain stable references
  const stableEndpoints = useRef(endpoints);
  const endpointsString = JSON.stringify(endpoints);
  const lastEndpointsString = useRef(endpointsString);
  
  // Only update the ref if the serialized version actually changed
  if (endpointsString !== lastEndpointsString.current) {
    stableEndpoints.current = endpoints;
    lastEndpointsString.current = endpointsString;
  }
  
  // Use the stable reference directly (no useMemo needed)
  const finalEndpoints = stableEndpoints.current;
  
  const [data, setData] = useState<Record<string, DropdownItem[]>>(() => {
    const initialData: Record<string, DropdownItem[]> = {};
    Object.keys(endpoints).forEach(key => {
      initialData[key] = [];
    });
    return initialData;
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use ref to prevent multiple simultaneous requests
  const isFetchingRef = useRef(false);

  const fetchData = useCallback(async () => {
    // Prevent multiple simultaneous fetches
    if (isFetchingRef.current) {
      console.log('Already fetching, skipping...');
      return;
    }
    
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const promises = Object.entries(finalEndpoints).map(async ([key, endpoint]) => {
        console.log(`Fetching ${key} from ${endpoint}`);
        
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          // Add credentials if your API requires authentication
          credentials: 'same-origin'
        });
        
        console.log(`Response for ${key}:`, {
          status: response.status,
          statusText: response.statusText,
          contentType: response.headers.get('content-type'),
          url: response.url
        });
        
        if (!response.ok) {
          // Get response text for debugging
          const responseText = await response.text();
          console.error(`Failed to fetch ${key}:`, responseText);
          throw new Error(`Failed to fetch ${key}: ${response.status} ${response.statusText}. Response: ${responseText.substring(0, 200)}`);
        }

        // Check if response is JSON before parsing
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const responseText = await response.text();
          console.error(`Non-JSON response for ${key}:`, responseText.substring(0, 500));
          throw new Error(`Response from ${key} is not JSON. Content-Type: ${contentType}. Response: ${responseText.substring(0, 200)}`);
        }

        try {
          const result = await response.json();
          console.log(`Successfully fetched ${key}:`, result);
          return [key, result];
        } catch (parseError) {
          const responseText = await response.text();
          console.error(`JSON parse error for ${key}:`, parseError, 'Response:', responseText);
          throw new Error(`Failed to parse JSON from ${key}: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
        }
      });

      const results = await Promise.all(promises);
      const dataObject = Object.fromEntries(results);
      setData(dataObject);
      console.log('All dropdown data fetched successfully:', dataObject);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      
      if (process.env.NODE_ENV === 'production') {
        setError('Failed to load dropdown data. Please try again later.');
      } else {
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
      }
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [finalEndpoints]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    isFetchingRef.current = false; // Reset the flag
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
};