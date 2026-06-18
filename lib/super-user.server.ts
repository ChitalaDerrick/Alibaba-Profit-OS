import { createClient } from '@/lib/supabase/server'

/**
 * Server-side check for super user (use in API routes and Server Components only)
 */
export async function isSuperUser(userId: string): Promise<boolean> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('super_users')
      .select('user_id')
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      return false
    }

    return true
  } catch (error) {
    console.error('[v0] Error checking super user status:', error)
    return false
  }
}
