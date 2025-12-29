import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qcwcjobumqyjjqhmwmjj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjd2Nqb2J1bXF5ampxaG13bWpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMDM0MzgsImV4cCI6MjA4MjU3OTQzOH0.LY3Vp1vKZ6yGvb3qr4SbxgFH-EmdD1xyKknFzmag0tk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
