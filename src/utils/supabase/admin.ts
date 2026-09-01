import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const resolvedUrl = url?.startsWith('http') ? url : 'https://placeholder-project.supabase.co';
  const resolvedServiceKey = serviceKey && serviceKey !== 'your_supabase_service_role_key' ? serviceKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy';

  return createClient(
    resolvedUrl,
    resolvedServiceKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
