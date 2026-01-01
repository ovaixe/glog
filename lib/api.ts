export function getAuthHeaders() {
  const token = localStorage.getItem("glog_auth");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const headers = { ...getAuthHeaders(), ...(options.headers as any) };
  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    // Optional: Dispatch event or handle logout
    // window.location.reload(); // Simple brute force way to trigger re-auth check
  }

  return response;
}
