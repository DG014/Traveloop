export const apiClient = async (endpoint: string, options: RequestInit = {}) => {
  const url = `/api${endpoint}`;
  
  // Omit Content-Type if body is FormData
  const isFormData = options.body instanceof FormData;
  const headers: HeadersInit = {
    ...options.headers,
  };
  
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) {
    throw data.error || new Error('API Request Failed');
  }
  return data;
};
