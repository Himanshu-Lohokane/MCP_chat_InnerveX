# Team Diplomats - Setup Guide

## 🎯 Complete Setup Instructions

### Phase 1: Copy Existing Chat Components ✅

Run these commands to copy your existing working chat functionality:

```powershell
# From the root hackathon directory
cd "d:\HIMANSHU\Hackathons\InnerveX AIT"

# Copy UI components
Copy-Item "productivity-software-client\components\ui\*.tsx" -Destination "team-diplomats-ai-productivity\client\components\ui\" -Recurse -Force

# Copy chat components
Copy-Item "productivity-software-client\components\TodoList.tsx" -Destination "team-diplomats-ai-productivity\client\components\" -Force
Copy-Item "productivity-software-client\components\MessageBubble.tsx" -Destination "team-diplomats-ai-productivity\client\components\" -Force
Copy-Item "productivity-software-client\components\UserListItem.tsx" -Destination "team-diplomats-ai-productivity\client\components\" -Force
Copy-Item "productivity-software-client\components\EmptyChatState.tsx" -Destination "team-diplomats-ai-productivity\client\components\" -Force

# Copy chat page
Copy-Item "productivity-software-client\app\chat\*" -Destination "team-diplomats-ai-productivity\client\app\chat\" -Recurse -Force

# Copy auth pages
Copy-Item "productivity-software-client\app\auth\*" -Destination "team-diplomats-ai-productivity\client\app\auth\" -Recurse -Force
Copy-Item "productivity-software-client\app\authentication\*" -Destination "team-diplomats-ai-productivity\client\app\authentication\" -Recurse -Force

# Copy hooks
Copy-Item "productivity-software-client\hooks\*.tsx" -Destination "team-diplomats-ai-productivity\client\hooks\" -Recurse -Force
```

### Phase 2: Supabase Setup

1. **Use your existing Supabase database** from the old project
2. **Add n8n webhook trigger function**:

```sql
-- Enable HTTP extension
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- Function to notify n8n on new message
CREATE OR REPLACE FUNCTION notify_n8n_new_message()
RETURNS TRIGGER AS $$
DECLARE
  n8n_webhook_url TEXT := 'https://your-n8n-instance.app.n8n.cloud/webhook/new-message';
BEGIN
  -- Only process non-system messages that haven't been processed
  IF NEW.is_system = false AND COALESCE(NEW.is_task_created, false) = false THEN
    PERFORM extensions.http_post(
      url := n8n_webhook_url,
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := jsonb_build_object(
        'id', NEW.id,
        'content', NEW.content,
        'sender_id', NEW.sender_id,
        'receiver_id', NEW.receiver_id,
        'created_at', NEW.created_at
      )::text
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_message_insert_notify_n8n ON messages;
CREATE TRIGGER on_message_insert_notify_n8n
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_n8n_new_message();
```

3. **Add confidence and reasoning columns to tasks table**:

```sql
-- Already exists in your schema, but verify:
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS confidence DECIMAL(5, 4) DEFAULT 0.5;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reasoning TEXT;
```

### Phase 3: n8n Workflow Setup

1. **Sign up for n8n Cloud** (or self-host): https://n8n.io/
2. **Import the workflow** from `n8n/task-extraction-workflow.json`
3. **Configure credentials**:
   - Google Gemini API
   - Supabase connection
   - Google Calendar OAuth

4. **Copy webhook URL** and update Supabase function above

### Phase 4: Client Environment Setup

```bash
cd client
npm install

# Create .env.local
cp .env.example .env.local

# Edit .env.local with:
NEXT_PUBLIC_SUPABASE_URL=https://aqvcputumdyzxbpljgwa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG... (your existing key)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

### Phase 5: Run the Application

```bash
npm run dev
```

Open http://localhost:3000

---

## 📊 Architecture Flow

```
User sends message → Supabase (saves message)
                    ↓
              Real-time subscription → Updates UI instantly
                    ↓
          Database webhook → n8n workflow
                              ↓
                    AI Agent (Gemini 2.0 Flash)
                              ↓
                    Analyzes message:
                    - Task content
                    - Priority
                    - Confidence score
                    - Reasoning
                    - Due date
                              ↓
                  IF confidence > 0.7:
                    - Create task in Supabase
                    - Create Google Calendar event (if has date)
                              ↓
          Real-time subscription → TodoList updates
```

## 🎨 Key Features Implemented

✅ Real-time chat with Supabase
✅ Todo list sidebar with live updates  
✅ AI task extraction (via n8n)
✅ Confidence scoring & reasoning display
✅ Google Calendar integration
✅ Theme toggle (light/dark)
✅ Responsive design

## 🔧 Next Steps

1. Copy existing components (Phase 1)
2. Set up n8n workflow (Phase 3)
3. Configure Supabase webhook (Phase 2)
4. Test end-to-end flow
5. Record demo video
6. Deploy to Vercel + n8n Cloud

## 📹 Demo Script

1. **Show landing page** - explain problem statement
2. **Login** - show authentication
3. **Send message**: "We need to finish the presentation by Friday 5pm"
4. **Show task appear** in todo list with:
   - Confidence score
   - AI reasoning
   - Priority level
5. **Show Google Calendar** - event auto-created
6. **Send update**: "Actually, I need it by Thursday"
7. **Show semantic matching** - AI updates the correct task
8. **Show n8n workflow** - visual representation of AI processing

## 🚀 Deployment

**Client (Vercel)**:
```bash
vercel --prod
```

**n8n**: Already hosted on n8n Cloud

**Supabase**: Already hosted

---

## Team Members

- Anushka Salvi
- Rashi Kachawah
- Akshay Nazare
- Himanshu Lohokane

**Theme**: Open Innovation  
**College**: VIT Pune
