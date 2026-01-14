# n8n Quick Start - 3 Steps to Get Running

## ⚡ Immediate Action Required

### 1. Add Service Role Key (2 minutes)

Open `client/.env.local` and add your Supabase service role key:

```env
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key-here
```

**Where to find it:**
- Go to: https://supabase.com/dashboard/project/ypzpwjfddhnmuihnjhuo/settings/api
- Copy the **`service_role`** secret key (NOT the anon key)
- Paste it in `.env.local`

Then restart the dev server:
```powershell
cd client
npm run dev
```

---

### 2. Update n8n Workflow (5 minutes)

Your webhook: `https://n8n.lohokane.in/webhook/f440812b-e991-4ae5-ae53-35551cf021f6`

#### A. Update Webhook Node Payload

Expect this structure:
```json
{
  "chatInput": "message text",
  "sessionId": "userId1:userId2",
  "senderId": "uuid",
  "receiverId": "uuid",
  "messageId": "uuid",
  "timestamp": "ISO date"
}
```

#### B. Update AI Agent System Prompt

Copy from `n8n-system-prompt.md` → paste into your AI Agent node

**Key point:** Use `{{ $json.body.sessionId }}` as the memory key for conversation context

#### C. Add HTTP Request Callback Node

Add after your AI Agent node:

- **Method**: POST
- **URL**: `http://localhost:3000/api/n8n-callback` (or your production URL)
- **Body**:
  ```json
  {
    "output": "{{ $json.output }}",
    "sessionId": "{{ $json.body.sessionId }}",
    "originalMessageId": "{{ $json.body.messageId }}"
  }
  ```

---

### 3. Test It (1 minute)

1. Open your chat app
2. Send: **"Let's meet tomorrow at 7am"**
3. Watch for:
   - Your message appears immediately
   - ~5 seconds later, system message with 🤖: "✅ Created calendar event..."

**Debug:**
- Browser console: Look for `[n8n]` logs
- Terminal: Look for `[api:n8n-callback]` logs
- n8n dashboard: Check execution logs

---

## 🎯 What You Get

- ✅ AI agent monitors all conversations
- ✅ Auto-creates calendar events when users mention meetings
- ✅ Can send emails, search web, get weather, etc.
- ✅ System messages appear in chat with 🤖 icon
- ✅ Non-blocking (chat works even if n8n is down)
- ✅ Full conversation context (sessionId)

---

## 📚 Full Documentation

See `N8N_SETUP_GUIDE.md` for:
- Complete architecture diagram
- Detailed troubleshooting
- Security notes
- Testing guide
- UI customization

---

## 🐛 Quick Fixes

**System messages not appearing?**
→ Check service role key in `.env.local`
→ Restart dev server

**n8n not receiving messages?**
→ Check `NEXT_PUBLIC_N8N_WEBHOOK_URL` in `.env.local`
→ Verify webhook URL is correct

**Agent has no context?**
→ Use `sessionId` as memory key in AI Agent node

---

**That's it! You're ready to go. 🚀**

Need help? Check the full guide or your browser console logs.
