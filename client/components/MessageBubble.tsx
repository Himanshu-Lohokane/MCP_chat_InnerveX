import React from 'react'
import { Message } from '../types'

interface MessageBubbleProps {
  message: Message
  isCurrentUser: boolean
  isHighlighted?: boolean
}

const MessageBubble = React.memo(function MessageBubble({
  message,
  isCurrentUser,
  isHighlighted = false,
}: MessageBubbleProps) {
  // System messages (AI agent responses) get special styling
  if (message.is_system) {
    return (
      <div className="flex justify-center my-3">
        <div className="max-w-md px-4 py-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 shadow-sm">
          <div className="flex items-start gap-2">
            <span className="text-amber-600 mt-0.5">🤖</span>
            <p className="text-sm leading-relaxed">{message.content}</p>
          </div>
          <p className="text-xs text-amber-600 mt-1 text-right">
            {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
      <div className="flex flex-col items-end max-w-xs lg:max-w-md">
        <div
          className={`px-4 py-3 rounded-2xl shadow-sm ${
            isCurrentUser
              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
              : "bg-white border border-slate-200 text-slate-800"
          } ${isHighlighted ? "ring-2 ring-yellow-400 ring-opacity-75" : ""}`}
        >
          <p className="break-words leading-relaxed">{message.content}</p>
        </div>
        <div className="flex items-center mt-2 space-x-2">
          <p className={`text-xs ${isCurrentUser ? "text-blue-600" : "text-slate-500"}`}>
            {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
          {isCurrentUser && (
            <span className={`text-xs ${message.is_read ? "text-blue-600" : "text-slate-400"}`}>
              {message.is_read ? "✓✓" : "✓"}
            </span>
          )}
        </div>
      </div>
    </div>
  )
})

export default MessageBubble