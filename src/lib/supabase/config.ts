/**
 * Checks whether Supabase is configured with real, reachable credentials.
 * If credentials are missing, empty, or contain placeholder strings, returns false.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !key) return false;
  if (url.includes('placeholder') || key.includes('placeholder')) return false;
  if (url.includes('your-project-id') || key.includes('your-anon-key')) return false;

  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * Creates a fetch wrapper with a strict timeout (default: 2500ms)
 * to prevent any Supabase query or auth call from hanging indefinitely.
 */
export function createTimeoutFetch(timeoutMs = 2500): typeof fetch {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    try {
      const response = await fetch(input, {
        ...init,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(timer);
    }
  };
}
