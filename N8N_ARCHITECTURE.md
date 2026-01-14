# n8n Integration Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        USER SENDS MESSAGE                                │
│                     "Let's meet tomorrow at 7am"                         │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   NEXT.JS CLIENT (page.tsx)                              │
│  • User types message in chat UI                                         │
│  • Clicks send button                                                    │
│  • sendMessage() function executes                                       │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                ┌───────────────┴────────────────┐
                ▼                                ▼
┌──────────────────────────────┐  ┌──────────────────────────────────┐
│   SUPABASE (Primary Path)    │  │    n8n (Parallel Path)           │
│  • Insert message to DB       │  │  • triggerN8nAgent()             │
│  • Realtime broadcasts        │  │  • Fire-and-forget webhook       │
│  • All users see message      │  │  • 30s timeout                   │
└──────────────┬───────────────┘  └────────────┬─────────────────────┘
               │                               │
               │                               ▼
               │               ┌─────────────────────────────────────┐
               │               │   n8n WEBHOOK RECEIVES              │
               │               │  {                                  │
               │               │    chatInput: "meet tomorrow 7am"   │
               │               │    sessionId: "user1:user2"         │
               │               │    senderId: "uuid"                 │
               │               │    receiverId: "uuid"               │
               │               │    messageId: "uuid"                │
               │               │    timestamp: "2024-..."            │
               │               │  }                                  │
               │               └────────────┬────────────────────────┘
               │                            │
               │                            ▼
               │               ┌─────────────────────────────────────┐
               │               │   AI AGENT (Google Gemini)          │
               │               │  • Load conversation from memory    │
               │               │    (keyed by sessionId)             │
               │               │  • Understand context               │
               │               │  • Decide if action needed          │
               │               │  • Execute tool (Calendar/Email/..) │
               │               └────────────┬────────────────────────┘
               │                            │
               │                            ▼
               │               ┌─────────────────────────────────────┐
               │               │   TOOLS (as needed)                 │
               │               │  • Google Calendar API              │
               │               │  • Gmail API                        │
               │               │  • SerpAPI (web search)             │
               │               │  • Date/Time utilities              │
               │               └────────────┬────────────────────────┘
               │                            │
               │                            ▼
               │               ┌─────────────────────────────────────┐
               │               │   n8n HTTP CALLBACK                 │
               │               │  POST /api/n8n-callback             │
               │               │  {                                  │
               │               │    output: "✅ Created event..."    │
               │               │    sessionId: "user1:user2"         │
               │               │    originalMessageId: "uuid"        │
               │               │  }                                  │
               │               └────────────┬────────────────────────┘
               │                            │
               │                            ▼
               │               ┌─────────────────────────────────────┐
               │               │   NEXT.JS API ROUTE                 │
               │               │  • Validate payload                 │
               │               │  • Use service role key             │
               │               │  • Insert system message            │
               │               │    - is_system: true                │
               │               │    - is_read: true                  │
               │               └────────────┬────────────────────────┘
               │                            │
               │                            ▼
               │               ┌─────────────────────────────────────┐
               │               │   SUPABASE (System Message)         │
               │               │  • Insert with service role         │
               │               │  • Bypasses RLS                     │
               │               │  • Realtime broadcasts              │
               │               └────────────┬────────────────────────┘
               │                            │
               └────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   ALL CONNECTED CLIENTS                                  │
│  • Receive realtime updates                                              │
│  • User message appears in chat                                          │
│  • System message appears with 🤖                                        │
│    "✅ Created calendar event: Meeting on Jan 15, 2024 at 7:00 AM"      │
└─────────────────────────────────────────────────────────────────────────┘
```

## Key Design Decisions

### 1. **Parallel Execution**
- Supabase insert and n8n webhook happen in parallel
- Chat functionality doesn't depend on n8n
- If n8n fails, users still see their messages

### 2. **Non-Blocking**
- `triggerN8nAgent()` is fire-and-forget
- No `await` - doesn't block UI
- Errors logged to console, not shown to users
- 30s timeout prevents hung requests

### 3. **Session-Based Context**
- `sessionId = userId1:userId2` (sorted)
- Same conversation ID regardless of who sends
- AI agent loads full chat history from memory
- Enables context-aware responses

### 4. **System Messages**
- Special message type (`is_system: true`)
- Inserted with service role key (bypasses RLS)
- Displayed differently in UI (amber + 🤖)
- Cannot be edited or deleted by users

### 5. **Error Handling**
- Structured logging: `[n8n]`, `[api:n8n-callback]`, `[chat:send]`
- AbortController with timeouts
- Try-catch at every async operation
- User-friendly toast notifications for critical errors

## Data Flow Timing

```
0ms    - User clicks send
10ms   - Message inserted to Supabase
15ms   - Realtime pushes to all clients
15ms   - User sees their message
20ms   - n8n webhook triggered (parallel)
1000ms - n8n receives webhook
2000ms - AI agent processes
3000ms - Agent uses Calendar API
4000ms - n8n calls back to Next.js
4100ms - System message inserted
4200ms - Realtime pushes system message
4300ms - User sees 🤖 "✅ Created event..."
```

**Total perceived latency for user message: ~15ms**  
**Total time to see AI response: ~4.3 seconds**

## File Structure

```
client/
├── .env.local                 # Environment variables (with service role key)
├── types.ts                   # TypeScript interfaces (Message with is_system)
├── app/
│   ├── chat/
│   │   └── page.tsx          # Chat UI with n8n integration
│   └── api/
│       └── n8n-callback/
│           └── route.ts      # API endpoint for n8n responses
├── components/
│   ├── MessageBubble.tsx     # System message rendering
│   └── toast.tsx             # Toast notifications
└── utils/
    ├── n8n.ts               # n8n webhook utilities
    └── supabase.ts          # Supabase client with timeouts

n8n-system-prompt.md          # AI agent system prompt
N8N_SETUP_GUIDE.md            # Comprehensive documentation
N8N_QUICK_START.md            # 3-step quick start guide
```

## Code Integration Points

### 1. Message Send (page.tsx)
```typescript
// After successful Supabase insert:
triggerN8nAgent({
  chatInput: message,
  sessionId: createSessionId(senderId, receiverId),
  senderId,
  receiverId,
  messageId: insertedMessage.id,
  timestamp: new Date().toISOString(),
})
```

### 2. System Message Rendering (MessageBubble.tsx)
```typescript
if (message.is_system) {
  return (
    <div className="flex justify-center my-4">
      <div className="bg-amber-100 dark:bg-amber-900/20 p-3 rounded-lg">
        <div className="text-xl mb-2 text-center">🤖</div>
        <p>{message.content}</p>
      </div>
    </div>
  )
}
```

### 3. API Callback (route.ts)
```typescript
const { data, error } = await adminSupabase
  .from("messages")
  .insert({
    sender_id: participants[0],
    receiver_id: participants[1],
    content: output,
    is_system: true,
    is_read: true,
  })
```

## Security & Performance

- **Service Role Key**: Only used server-side in API route
- **Rate Limiting**: Consider adding to `/api/n8n-callback`
- **Timeouts**: 15s for Supabase, 30s for n8n
- **Memory**: AI agent memory grows with conversation (monitor usage)
- **Database**: Indexed queries for fast message retrieval
- **Realtime**: Efficient postgres_changes subscription

## Future Enhancements

- [ ] Add typing indicator when AI is processing
- [ ] Show tool usage in system message ("🔍 Searching...", "📧 Sending email...")
- [ ] Allow users to retry failed AI actions
- [ ] Add conversation summaries for long threads
- [ ] Implement user feedback on AI actions (👍/👎)
- [ ] Add admin dashboard for monitoring n8n executions
