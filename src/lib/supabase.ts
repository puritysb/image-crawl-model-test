import { createClient } from '@supabase/supabase-js';
import { Database } from '@shared/types'; // Assuming shared types are accessible via alias

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key environment variables.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
