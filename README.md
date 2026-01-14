# Team Diplomats - AI Productivity Assistant

**InnerveX AIT Hackathon Submission**  
**Theme**: Open Innovation  
**College**: Vishwakarma Institute of Technology, Pune

## 🎯 Problem Statement

People lose track of commitments made in conversations. Our AI-powered chat assistant silently monitors conversations and automatically:
- Creates calendar events when meetings are mentioned
- Sends emails when requested
- Searches for information when needed
- Takes action proactively without interrupting the conversation

## 🏗️ Architecture

```
User sends message in chat
  ↓
Next.js → Supabase (message stored, realtime update)
  ↓
n8n webhook triggered (non-blocking)
  ↓
AI Agent (silent observer)
  - Analyzes conversation context
  - Decides if action is needed
  - Uses tools: Calendar, Gmail, Search, Date/Time
  ↓
Agent responds via webhook
  ↓
System message appears in chat with 🤖 icon
```

**Key Design**: The AI is a **silent observer**, not a chatbot. It only responds when it actually takes action.

## ✨ Key Features

✅ **Silent Observer AI** - Monitors conversations, acts only when needed (no chatbot spam)  
✅ **Smart Calendar Events** - "meeting tomorrow at 7am" → auto-creates calendar event  
✅ **Conversation Context** - Full chat history gives AI proper context for decisions  
✅ **Non-blocking UX** - Chat is seamless, AI works in background  
✅ **Real-time Updates** - Supabase realtime for instant message delivery  
✅ **System Messages** - AI feedback appears as special messages with 🤖 icon  
✅ *🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Realtime + Auth with PKCE flow)
- **AI/Automation**: n8n with AI Agent node (Claude 3.5 Sonnet / GPT-4o recommended)
- **Integrations**: Google Calendar API, Gmail API, SerpAPI, Date/Time utilities
- **Architecture**: PKCE auth, realtime subscriptions, optimistic UI updates, fire-and-forget webhooksth)
- **AI/Automation**: n8n, Google Gemini 2.0 Flash
- **Integrations**: Google Calendar API, Google Meet
🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/Himanshu-Lohokane/MCP_chat_InnerveX.git
cd team-diplomats-ai-productivity/client
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
- `NEXT_PUBLIC_SUPABASE_URL` - From Supabase dashboard
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - From Supabase dashboard
- `SUPABASE_SERVICE_ROLE_KEY` - From Supabase Settings > API (needed for system messages)
- `NEXT_PUBLIC_N8N_WEBHOOK_URL` - Your n8n webhook URL

### 3. Supabase Setup
1. Create a new Supabase project
2. Run SQL from `supabase/schema.sql` in SQL Editor
3. Enable Realtime on `messages` and `tasks` tables
4. Copy your project URL and keys

### 4. n8n Workflow Setup
1. 🎥 Demo

[Add demo video link here]

## 👥 Team Diplomats

- **Anushka Salvi** - anushka.salvi.93@gmail.com
- **Rashi Kachawah** - kacchwahrashi@gmail.com  
- **Akshay Nazare** - akshayynazare@gmail.com
- **Himanshu Lohokane** - lohokanehimanshu@gmail.com

Vishwakarma Institute of Technology, Pune

## 📄 License

MIT License

---

**Open Innovation in Action** 🚀  
Built for InnerveX AIT Hackathon
Open http://localhost:3000 and test:
- Sign up / login
- Send message: "we need to have a meeting at 8pm today"
- Watch for 🤖 system message confirming calendar event creation

## 📝 How It Works

1. **User sends message** → Instantly appears in chat (Supabase realtime)
2. **n8n webhook triggered** → Non-blocking, runs in background
3. **AI Agent analyzes** → Uses conversation history (sessionId) for context
4. **Agent decides** → Meeting mentioned? Call Date/Time tool → Call Calendar API
5. **Agent responds** → Only if action was taken: "✅ Created event..."
6. **System message** → Appears in chat with 🤖 icon via realtime subscription

## 🤖 AI Agent Behavior

The AI is a **silent observer** that only speaks when it performs an action:

**Stays silent for:**
- Casual chat between users
- Vague mentions ("we should meet sometime")
- Questions users ask each other

**Takes action for:**
- "meeting tomorrow at 7am" → Creates calendar event
- "email this to john@example.com" → Sends email
- "what's the weather in SF?" → Searches and responds

**Response format:** `"✅ Created event: Meeting on Jan 15, 2026 at 7:00 AM"`API
- Test by sending a message!

## Team Members

- Anushka Salvi - anushka.salvi.93@gmail.com
- Rashi Kachawah - kacchwahrashi@gmail.com  
- Akshay Nazare - akshayynazare@gmail.com
- Himanshu Lohokane - lohokanehimanshu@gmail.com

## Demo

YouTube: [Link to demo video]

---

**Open Innovation in Action** 🚀
