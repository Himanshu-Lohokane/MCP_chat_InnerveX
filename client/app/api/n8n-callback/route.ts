/**
 * API endpoint to receive n8n agent responses and insert them as system messages
 * Called by n8n workflow after agent processes the message
 */

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { output, sessionId, originalMessageId } = body

    if (!output || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields: output, sessionId' },
        { status: 400 }
      )
    }

    console.log('[api:n8n-callback] received', {
      sessionId,
      outputLen: output.length,
      originalMessageId,
    })

    // Extract user IDs from sessionId (format: "userId1:userId2")
    const [userId1, userId2] = sessionId.split(':')
    if (!userId1 || !userId2) {
      return NextResponse.json({ error: 'Invalid sessionId format' }, { status: 400 })
    }

    // Use service role key to bypass RLS for system messages
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Insert system message into the conversation
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: userId1, // Arbitrary - system messages don't have a real sender
        receiver_id: userId2,
        content: output,
        is_system: true,
        is_read: true, // System messages are auto-read
      })
      .select('id, created_at')
      .single()

    if (error) {
      console.error('[api:n8n-callback] insert failed', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('[api:n8n-callback] inserted system message', { id: data.id })

    return NextResponse.json({ success: true, messageId: data.id })
  } catch (error: any) {
    console.error('[api:n8n-callback] error', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
