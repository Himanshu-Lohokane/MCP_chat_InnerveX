export interface ChatUser {
  id: string
  username?: string
  full_name?: string
  avatar_url?: string
  updated_at?: string
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
  is_read?: boolean
  is_system?: boolean
  is_task_created?: boolean
  is_optimistic?: boolean
  failed?: boolean
}

export interface Task {
  id: string
  content: string
  description?: string
  priority: "low" | "medium" | "high" | "urgent"
  confidence: number
  reasoning: string
  message_id: string
  sender_id: string
  receiver_id: string
  status: "pending" | "in_progress" | "completed" | "cancelled"
  due_date?: string
  start_date?: string
  start_time?: string
  end_time?: string
  completed_at?: string
  created_at: string
  updated_at: string
  calendar_event_id?: string
}
