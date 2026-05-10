export const apiClient = async (endpoint: string, options: RequestInit = {}) => {
  const url = `/api${endpoint}`;

  // Omit Content-Type if body is FormData (browser sets it with boundary)
  const isFormData = options.body instanceof FormData;
  const headers: HeadersInit = { ...options.headers };
  if (!isFormData && !headers['Content-Type' as keyof HeadersInit]) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, { ...options, headers, credentials: 'include' });
  const data = await response.json();

  if (!response.ok) {
    // Normalise API error envelope { code, message } into a real Error
    const apiError = data?.error;
    const message = apiError?.message || data?.message || 'Request failed';
    const error = new Error(message) as Error & { code?: string; field?: string };
    error.code = apiError?.code;
    error.field = apiError?.field;
    throw error;
  }

  return data;
};
