import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const resolvedUrl = url?.startsWith('http') ? url : 'https://placeholder-project.supabase.co';
  const resolvedAnonKey = anonKey && anonKey !== 'your_supabase_anon_key' ? anonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy';

  return createBrowserClient(resolvedUrl, resolvedAnonKey);
}
