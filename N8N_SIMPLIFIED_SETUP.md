# n8n Setup - Simplified with Direct Response

## 🎯 New Approach

Instead of a separate callback HTTP request, we now use the **"Respond to Webhook" node directly**. This is simpler and works perfectly with localhost!

### Flow:
```
User sends message
  ↓
Next.js inserts to Supabase (user sees message immediately)
  ↓
Next.js calls n8n webhook (waits for response)
  ↓
n8n AI Agent processes with tools (Calendar/Email/Search)
  ↓
n8n "Respond to Webhook" returns the output
  ↓
Next.js receives response and inserts system message
  ↓
Realtime pushes system message to all users (🤖)
```

---

## ✅ What's Already Done

- ✅ Service role key added to `.env.local`
- ✅ n8n webhook URL configured
- ✅ Client code updated to wait for webhook response
- ✅ System message rendering with 🤖 icon

---

## 🔧 n8n Workflow Setup (3 Steps)

### Step 1: Webhook Node Configuration

Your webhook should accept this payload:

```json
{
  "chatInput": "Let's meet tomorrow at 7am",
  "sessionId": "user-id-1:user-id-2",
  "senderId": "uuid",
  "receiverId": "uuid", 
  "messageId": "uuid",
  "timestamp": "2024-01-14T10:30:00Z"
}
```

**Important**: Use `sessionId` as the memory key for your AI Agent so it has full conversation context.

### Step 2: AI Agent Node

1. Set **Memory Key**: `{{ $json.body.sessionId }}`
2. Update **System Prompt** with content from `n8n-system-prompt.md`:
   - Role: Monitor conversations and take proactive actions
   - Tools: Google Calendar, Gmail, SerpAPI, Date/Time
   - Guidelines: Be conversational, confirm actions, be proactive but not intrusive

### Step 3: Respond to Webhook Node

This is what you already have! Just make sure it's configured to respond with:

```json
{
  "output": "{{ $json.output }}"
}
```

Where `$json.output` is the AI agent's response text.

**That's it!** No additional HTTP Request callback node needed.

---

## 🧪 Testing

1. **Start the dev server** (if not running):
   ```powershell
   cd client
   npm run dev
   ```

2. **Open your chat app** at http://localhost:3000

3. **Send a test message**:
   ```
   "Let's meet tomorrow at 7am to discuss the project"
   ```

4. **Expected behavior**:
   - Your message appears instantly
   - Wait ~3-5 seconds
   - System message appears with 🤖: "✅ Created calendar event: Meeting on January 15, 2026 at 7:00 AM"

---

## 🔍 Debug Checklist

**Check browser console logs:**
- `[n8n] sending` - Webhook triggered
- `[n8n] response received` - Got response from n8n
- `[chat:send] inserting system message from n8n` - Inserting AI response

**Check n8n execution logs:**
- Webhook received payload
- AI Agent processed message
- Respond to Webhook sent output

**If system message doesn't appear:**
1. Check `.env.local` has correct webhook URL
2. Verify n8n workflow is active (not paused)
3. Check n8n execution logs for errors
4. Verify "Respond to Webhook" node has `output` field

**If agent has no context:**
- Ensure AI Agent node uses `{{ $json.body.sessionId }}` as memory key
- Check n8n agent logs to verify memory is being loaded

---

## 📝 Example n8n Response

Your "Respond to Webhook" node should return:

```json
{
  "output": "✅ Created calendar event: Team Meeting on January 15, 2026 at 7:00 AM. I've also sent a confirmation email to all participants."
}
```

This will appear in the chat as a system message with the 🤖 icon.

---

## 🎨 What Users See

**User message (right side):**
> Let's meet tomorrow at 7am to discuss the project

**System message (centered, amber background):**
> 🤖  
> ✅ Created calendar event: Team Meeting on January 15, 2026 at 7:00 AM

---

## 💡 Tips

- **Keep responses concise**: Users prefer short confirmations over long explanations
- **Use emojis**: ✅, 📧, 📅, 🔍 make system messages friendly
- **Confirm actions**: Always tell users what was done
- **Handle failures gracefully**: If calendar fails, agent should explain why

---

## 📚 Documentation Files

- `n8n-system-prompt.md` - Complete AI agent prompt
- `N8N_ARCHITECTURE.md` - Technical architecture
- `N8N_SETUP_GUIDE.md` - Original detailed guide (still valid, just ignore the callback section)

---

## 🚀 You're Ready!

Send a test message and watch the AI agent respond! The webhook responds directly, so you get immediate feedback in the chat UI.
