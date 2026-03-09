/**
 * Safely parse JSON from a fetch Response.
 * If the response is HTML (e.g. 404/500 page) or invalid JSON, returns null instead of throwing.
 */
export async function fetchJson<T = unknown>(res: Response): Promise<T | null> {
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return null;
  }
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
