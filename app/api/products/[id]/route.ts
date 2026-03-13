import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isAdminRequest } from '@/lib/auth-api'
import type { ProductUpdate } from '@/lib/supabase/types'

function getServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase config')
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await isAdminRequest()
    if (!admin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    const { id } = await params
    const supabase = getServiceRoleClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()
    if (error) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await isAdminRequest()
    if (!admin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    const { id } = await params
    const body: ProductUpdate = await request.json()
    const supabase = getServiceRoleClient()
    const { data, error } = await supabase
      .from('products')
      .update(body)
      .eq('id', id)
      .select()
      .single()
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await isAdminRequest()
    if (!admin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    const { id } = await params
    const supabase = getServiceRoleClient()
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
