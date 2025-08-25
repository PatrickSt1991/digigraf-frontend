import { API_BASE } from "./apiConfig";

interface ApiOptions extends RequestInit {
    body?: any;
}

async function apiClient<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { body, headers, ...rest } = options;
console.log(API_BASE);
console.log(endpoint);
    const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
            "Content-Type": "application/json",
            ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        ...rest,
    });

    if(!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `API error: ${res.status}`);
    }

    if (res.status === 204) return {} as T;

    return res.json() as Promise<T>;
}

export default apiClient;