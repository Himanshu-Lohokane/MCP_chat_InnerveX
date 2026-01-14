# 📊 Visual Assets Guide

## Architecture Diagrams

### For PPT/Presentation

Use these ASCII diagrams in your presentation or convert to images using tools like:
- Excalidraw (https://excalidraw.com/)
- Draw.io (https://draw.io/)
- Mermaid Live Editor (https://mermaid.live/)

### Simple Flow Diagram (for slides)

```
┌─────────┐      ┌──────────┐      ┌─────────┐      ┌──────────┐
│  User   │─────►│   Chat   │─────►│Supabase │─────►│   n8n    │
│ Message │      │    UI    │      │ Database│      │ Workflow │
└─────────┘      └──────────┘      └─────────┘      └──────────┘
                                                           │
                                                           ▼
                                                     ┌──────────┐
                                                     │   AI     │
                                                     │ Gemini   │
                                                     └──────────┘
                                                           │
                                    ┌──────────────────────┴──────────┐
                                    ▼                                  ▼
                              ┌──────────┐                      ┌───────────┐
                              │  Task    │                      │  Google   │
                              │ Created  │                      │ Calendar  │
                              └──────────┘                      └───────────┘
                                    │
                                    ▼
                              ┌──────────┐
                              │ Todo UI  │
                              │ Updates  │
                              └──────────┘
```

### Comparison Diagram (Old vs New)

```
OLD ARCHITECTURE (Complex)              NEW ARCHITECTURE (Simple)
━━━━━━━━━━━━━━━━━━━━━━━━━              ━━━━━━━━━━━━━━━━━━━━━━━━━

    User Message                            User Message
         │                                       │
    Supabase                                Supabase
         │                                       │
    MCP Server                              n8n Workflow
         │                                       │
    ┌────┴────┐                            AI Analysis
    │ 4 LLM   │                            (Gemini)
    │ Calls   │                                  │
    └────┬────┘                            Create Task
         │                                       │
    Cohere API                              Real-time UI
         │
    Vector Search
         │
    Create Task
         │
    Real-time UI

Cost: $0.004/msg                    Cost: $0.0001/msg
Time: 5-10 sec                      Time: 1-2 sec
Code: 1900 lines                    Code: 8 nodes
