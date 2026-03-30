import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = 'https://ruuimirarxagzaqrhbxc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1dWltaXJhcnhhZ3phcXJoYnhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMTYwNDYsImV4cCI6MjA4NzY5MjA0Nn0.uMnEkbAGwNkOp2JlrTs3CP_gesr2DBnoZnEYWs4WV7g';

export const supabase = createClient(supabaseUrl, supabaseKey);
