import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://lazhwkgzofpcgfefrfge.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxhemh3a2d6b2ZwY2dmZWZyZmdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NTQzNTksImV4cCI6MjA3NzUzMDM1OX0.3j4EQRAjI0Pb94VeFNKlQiDIJx3TjHFpHzfNlaXvw_k"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
