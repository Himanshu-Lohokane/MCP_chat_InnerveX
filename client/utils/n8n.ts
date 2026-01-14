/**
 * n8n webhook integration utility
 * Sends messages to n8n AI agent for processing (calendar, email, search, etc.)
 * Non-blocking - failures don't affect chat functionality
 */

export interface N8nPayload {
  chatInput: string
  sessionId: string
  senderId: string
  receiverId: string
  messageId: string
  timestamp: string
}

export interface N8nResponse {
  output?: string
  error?: string
}

const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL

/**
 * Send message to n8n webhook for AI agent processing
 * Returns the agent's response synchronously via "Respond to Webhook" node
 */
export async function triggerN8nAgent(payload: N8nPayload): Promise<N8nResponse | null> {
  if (!N8N_WEBHOOK_URL) {
    console.warn('[n8n] No webhook URL configured; skipping')
    return null
  }

  try {
    return await sendN8nRequest(payload)
  } catch (error: any) {
    console.error('[n8n] trigger failed (non-blocking)', {
      error: error.message,
      sessionId: payload.sessionId,
      messageId: payload.messageId,
    })
    return null
  }
}

/**
 * Internal async function that actually sends the request
 * Separated so we can fire-and-forget from triggerN8nAgent
 */
async function sendN8nRequest(payload: N8nPayload): Promise<N8nResponse> {
  console.log('[n8n] sending', {
    sessionId: payload.sessionId,
    messageId: payload.messageId,
    inputLen: payload.chatInput.length,
  })

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout

  try {
    const response = await fetch(N8N_WEBHOOK_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`n8n webhook returned ${response.status}`)
    }

    const data = await response.json()
    console.log('[n8n] response received', {
      sessionId: payload.sessionId,
      hasOutput: !!data?.output,
    })

    return data as N8nResponse
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Create a session ID from two user IDs (conversation-level context)
 * Always returns the same ID regardless of sender/receiver order
 */
export function createSessionId(userId1: string, userId2: string): string {
  return [userId1, userId2].sort().join(':')
}
