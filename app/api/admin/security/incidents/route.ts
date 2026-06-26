import { createClient } from '@/lib/supabase/server'
import { isSuperUser } from '@/lib/super-user.server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isSuperUser(user.id))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '100')
    const offset = parseInt(request.nextUrl.searchParams.get('offset') || '0')
    const filter = request.nextUrl.searchParams.get('type')

    let query = supabase
      .from('security_incidents')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (filter) {
      query = query.eq('incident_type', filter)
    }

    const { data, count, error } = await query

    if (error) {
      console.error('[v0] Error fetching security incidents:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Format response
    const incidents = data?.map(incident => ({
      id: incident.id,
      type: incident.incident_type,
      ip: incident.ip_address,
      path: incident.path,
      method: incident.method,
      userAgent: incident.user_agent,
      userId: incident.user_id,
      email: incident.email,
      details: incident.details,
      blocked: incident.was_blocked,
      createdAt: incident.created_at
    })) || []

    return NextResponse.json({
      incidents,
      total: count || 0,
      limit,
      offset
    })
  } catch (error) {
    console.error('[v0] Security incidents endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
