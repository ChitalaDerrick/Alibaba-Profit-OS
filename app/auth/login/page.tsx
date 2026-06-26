'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { checkLoginRateLimit, recordLoginAttempt, formatResetTime } from '@/lib/rate-limit'

export default function Page() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [resetTime, setResetTime] = useState<number | null>(null)
  const router = useRouter()

  // Check rate limit on mount and periodically update reset time
  useEffect(() => {
    const checkLimit = () => {
      const { allowed, resetTime: time } = checkLoginRateLimit()
      setIsRateLimited(!allowed)
      if (time) {
        setResetTime(time)
      }
    }

    checkLimit()
    const interval = setInterval(checkLimit, 1000) // Update every second
    return () => clearInterval(interval)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check rate limit
    const { allowed } = checkLoginRateLimit()
    if (!allowed) {
      setError('Too many login attempts. Please try again later.')
      return
    }

    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      console.log('[v0] Attempting login with email:', email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      console.log('[v0] Login response:', { data, error })
      
      if (error) {
        console.error('[v0] Login error from Supabase:', error)
        // Record failed attempt
        recordLoginAttempt()
        throw error
      }
      
      console.log('[v0] Login successful, redirecting to home')
      // Add a small delay to ensure session is properly set
      await new Promise(resolve => setTimeout(resolve, 500))
      router.push('/')
    } catch (error: unknown) {
      console.error('[v0] Login error:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
      // Check if now rate limited
      const { allowed, resetTime: time } = checkLoginRateLimit()
      if (!allowed && time) {
        setIsRateLimited(true)
        setResetTime(time)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>
                Enter your email below to login to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  {isRateLimited && resetTime && (
                    <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                      <p className="font-medium">Too many login attempts</p>
                      <p>Try again in {formatResetTime(resetTime)}</p>
                    </div>
                  )}
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading || isRateLimited}
                  >
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                  Don&apos;t have an account?{' '}
                  <Link
                    href="/auth/sign-up"
                    className="underline underline-offset-4"
                  >
                    Sign up
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
