import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { useAuth } from '@clerk/nextjs'

export function useClerkSupabaseClient() {
  const { getToken } = useAuth()

  async function createClerkSupabaseClient(): Promise<SupabaseClient> {
    const supabaseToken = await getToken({ template: 'supabase' })
    
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${supabaseToken}`,
          },
        },
      }
    )
  }

  return createClerkSupabaseClient
}