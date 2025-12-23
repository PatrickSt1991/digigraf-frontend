interface ApiOptions extends RequestInit {
    body?: any;
}

async function apiClient<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { body, headers, ...rest } = options;
    const res = await fetch(`${endpoint}`, {
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

    if (res.status === 204) return undefined as T;

    const text = await res.text();
    return text ? JSON.parse(text) as T : undefined as T;

}

export default apiClient;