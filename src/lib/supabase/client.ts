import { createBrowserClient } from '@supabase/ssr';
import { createTimeoutFetch } from './config';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createBrowserClient<any>(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: createTimeoutFetch(3000),
    },
  });
}
