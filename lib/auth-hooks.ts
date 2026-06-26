import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  isSuperUser?: boolean
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          // Check if user is a super user
          const { data: superUser } = await supabase
            .from('super_users')
            .select('id')
            .eq('user_id', user.id)
            .single()
          
          setUser({
            id: user.id,
            email: user.email || '',
            isSuperUser: !!superUser
          })
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('[v0] Auth check error:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const logout = useCallback(async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      setUser(null)
      router.push('/')
    } catch (error) {
      console.error('[v0] Logout error:', error)
    }
  }, [router])

  return { user, isLoading, logout }
}
