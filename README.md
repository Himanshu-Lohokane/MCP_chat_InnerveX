# Team Diplomats - AI Productivity Assistant

**InnerveX AIT Hackathon Submission**  
**Theme**: Open Innovation  
**College**: Vishwakarma Institute of Technology, Pune

## Problem Statement

60% of commitments made in conversations never become tracked tasks. Our AI-powered solution automatically extracts tasks from natural conversations, schedules them in Google Calendar, and provides transparent confidence scoring.

## Architecture

```
Next.js Chat App → Supabase (Real-time DB) → n8n Workflow
                                              ↓
                                    AI Task Extraction
                                              ↓
                                    Create Task + Calendar Event
```

## Key Innovations

✅ **Semantic Understanding** - AI understands "finish it Thursday" by analyzing context  
✅ **Confidence Scoring** - Every task shows AI confidence % and reasoning  
✅ **Bi-directional Calendar Sync** - Auto-creates events for both sender and receiver  
✅ **MCP Architecture** - Extensible to GitHub, Gmail, SERP, Jira via n8n  
✅ **Real-time Updates** - Supabase subscriptions for instant UI updates

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Real-time + Auth)
- **AI/Automation**: n8n, Google Gemini 2.0 Flash
- **Integrations**: Google Calendar API, Google Meet

## Setup Instructions

### 1. Client Setup
```bash
cd client
npm install
cp .env.example .env.local
# Add your Supabase credentials
npm run dev
```

### 2. Supabase Setup
- Run SQL schema from `supabase/schema.sql`
- Configure database webhooks to n8n endpoint
- Enable real-time on messages and tasks tables

### 3. n8n Setup
- Import workflow from `n8n/workflow.json`
- Configure Google OAuth credentials
- Set Supabase connection
- Deploy workflow and copy webhook URL

### 4. Connect Everything
- Add n8n webhook URL to Supabase function
- Configure Google Calendar API
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
