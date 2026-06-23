import { isSuperUser } from '@/lib/super-user.server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const isSuper = await isSuperUser(userId)

    return NextResponse.json({ isSuperUser: isSuper }, { status: 200 })
  } catch (error) {
    console.error('[v0] Super user check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
