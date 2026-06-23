'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, ArrowRight, Zap } from 'lucide-react'
import Link from 'next/link'

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          {/* Main Card */}
          <Card>
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl">Confirm your email</CardTitle>
              <CardDescription>
                We&apos;ve sent a verification link to your inbox
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-foreground leading-relaxed">
                Click the link in your email to verify your account. Once confirmed, you&apos;ll have access to the profit calculator with <span className="font-semibold">10 free tokens</span> to get started.
              </p>

              {/* Steps */}
              <div className="space-y-3 bg-secondary p-4 rounded-lg border border-border">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-foreground">Check your inbox</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Look for a message from us</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-foreground">Click the link</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Verify your email address</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-foreground">Start calculating</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Get your 10 free tokens</p>
                  </div>
                </div>
              </div>

              {/* Reward Info */}
              <div className="flex gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <Zap className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-foreground">Free starter tokens</p>
                  <p className="text-muted-foreground">You&apos;ll receive 10 tokens immediately after confirming your email</p>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-border/30 p-3 rounded-lg text-xs space-y-2">
                <p className="font-semibold text-foreground">Tip:</p>
                <p className="text-muted-foreground">
                  Not seeing the email? Check your spam folder or try resending the confirmation.
                </p>
              </div>

              {/* CTA */}
              <Link href="/auth/login" className="block">
                <Button className="w-full" size="lg">
                  Go to Login
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Help Text */}
          <p className="text-xs text-center text-muted-foreground">
            Already verified? <Link href="/auth/login" className="text-primary font-semibold hover:underline">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
