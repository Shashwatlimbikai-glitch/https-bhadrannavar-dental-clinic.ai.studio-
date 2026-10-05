import { createClient } from '@supabase/supabase-js';

export const SUPABASE_PROJECT_ID = 'ovvjunvcbqlcvrdbcyjp';
export const SUPABASE_URL = 'https://ovvjunvcbqlcvrdbcyjp.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_1S-PXDln3AtP1MnGRxC74g_v-8DnrmD';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
