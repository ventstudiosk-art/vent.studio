import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bvclkcweyqeqkddymxeq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2Y2xrY3dleXFlcWtkZHlteGVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MjQxMTksImV4cCI6MjA5NDQwMDExOX0.B3fra_vJiHwlXAzn-ct2mLUN1OFtNHm-ytulmpXp6xE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
