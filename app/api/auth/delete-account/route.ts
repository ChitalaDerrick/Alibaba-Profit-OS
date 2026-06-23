import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Delete user account
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error('[v0] Delete account error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete account' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Account deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Delete account error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}
