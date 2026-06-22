'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Hash, Send, Plus, Search, Pin, Smile, Paperclip,
  Phone, Video, MoreHorizontal, MessageSquare, X
} from 'lucide-react'
import { fetchChatRooms, fetchChatMessages, sendChatMessage, getCurrentUser, fetchAllUsers, createChatRoom, type ChatMessage, type User } from '@/lib/data'
import { supabase } from '@/lib/supabase'
import { cn, formatRelativeTime, getInitials } from '@/lib/utils'

export default function ChatPage() {
  const [user, setUser] = useState<any>(null)
  const [rooms, setRooms] = useState<any[]>([])
  const [activeRoom, setActiveRoom] = useState<any>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isAddContactOpen, setIsAddContactOpen] = useState(false)
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [searchContact, setSearchContact] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadRooms = async () => {
      const currentUser = getCurrentUser()
      setUser(currentUser)
      const list = await fetchChatRooms()
      setRooms(list)
      if (list.length > 0) {
        setActiveRoom(list[0])
      }
    }
    loadRooms()
  }, [])

  useEffect(() => {
    if (isAddContactOpen && availableUsers.length === 0) {
      fetchAllUsers().then(users => {
        setAvailableUsers(users.filter(u => u.id !== user?.id))
      })
    }
  }, [isAddContactOpen, user])

  useEffect(() => {
    if (!activeRoom) return

    const loadMessages = async () => {
      const list = await fetchChatMessages(activeRoom.id)
      setMessages(list)
    }
    loadMessages()

    const channel = supabase
      .channel(`chat:${activeRoom.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${activeRoom.id}`
        },
        async () => {
          const list = await fetchChatMessages(activeRoom.id)
          setMessages(list)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeRoom])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="spinner" />
      </div>
    )
  }

  const handleSend = async () => {
    if (!input.trim() || !user || !activeRoom) return
    const msg = await sendChatMessage(activeRoom.id, user.id, input)
    if (msg) {
      setMessages(prev => [...prev, msg])
      setInput('')
    }
  }

  const roomMessages = messages
  const onlineUsers: string[] = []

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4 -mt-6 -mx-6 px-6 pt-6 text-text">
      {/* Sidebar - rooms */}
      <div className="w-64 flex-shrink-0 card flex flex-col bg-surface border border-border hover:transform-none cursor-default">
        <div className="px-4 py-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-subtle" />
            <input placeholder="Search messages..." className="form-input pl-9 py-1 text-xs" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Channels */}
          <div className="px-3 pt-3 pb-1">
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider px-2 mb-1">Channels</p>
            {rooms.filter(r => r.type === 'channel').map(room => (
              <button
                key={room.id}
                onClick={() => setActiveRoom(room)}
                className={cn('w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left transition-all border-0 bg-transparent cursor-pointer',
                  activeRoom.id === room.id ? 'bg-surface-2 text-text font-semibold border border-border' : 'text-text-muted hover:text-text hover:bg-surface-2'
                )}
              >
                <Hash className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="text-xs flex-1 truncate">{room.name}</span>
              </button>
            ))}
          </div>

          {/* DMs */}
          <div className="px-3 pt-2 pb-3">
            <div className="flex items-center justify-between px-2 mb-1">
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Direct Messages</p>
              <button onClick={() => setIsAddContactOpen(true)} className="text-text-muted hover:text-text border-0 bg-transparent cursor-pointer"><Plus className="w-3 h-3" /></button>
            </div>
            {rooms.filter(r => r.type === 'dm').map(room => (
              <button
                key={room.id}
                onClick={() => setActiveRoom(room)}
                className={cn('w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left transition-all border-0 bg-transparent cursor-pointer',
                  activeRoom.id === room.id ? 'bg-surface-2 text-text font-semibold border border-border' : 'text-text-muted hover:text-text hover:bg-surface-2'
                )}
              >
                <div className="relative">
                  <div className="w-6 h-6 rounded-full avatar flex items-center justify-center text-[10px] font-bold uppercase font-sans">
                    {getInitials(room.name)}
                  </div>
                </div>
                <span className="text-xs font-semibold">{room.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Online indicator */}
        <div className="px-4 py-3 border-t border-border">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-text-muted">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span>Active Session</span>
          </div>
        </div>
      </div>

      {/* Chat window */}
      {!activeRoom ? (
        <div className="flex-1 card flex flex-col items-center justify-center bg-surface border border-border hover:transform-none cursor-default">
          <MessageSquare className="w-12 h-12 text-text-subtle mb-3" />
          <p className="text-text-muted font-medium">Select a channel or direct message to start chatting</p>
        </div>
      ) : (
        <div className="flex-1 card flex flex-col min-w-0 bg-surface border border-border hover:transform-none cursor-default">
          {/* Chat header */}
          <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-surface">
            <div className="flex items-center gap-3">
              {activeRoom.type === 'channel' ? (
                <Hash className="w-5 h-5 text-text-muted" />
              ) : (
                <div className="relative">
                  <div className="w-8 h-8 rounded-full avatar flex items-center justify-center text-sm font-bold uppercase">
                    {getInitials(activeRoom.name)}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-success border border-surface" />
                </div>
              )}
              <div>
                <h3 className="font-bold text-text text-sm">{activeRoom.name}</h3>
                <p className="text-xs text-text-muted font-semibold">{activeRoom.members.length} members</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {[
                { icon: Phone },
                { icon: Video },
                { icon: Search },
                { icon: MoreHorizontal }
              ].map((btn, i) => (
                <button key={i} className="p-2 rounded-lg hover:bg-surface-2 text-text-muted hover:text-text transition-all border-0 bg-transparent cursor-pointer">
                  <btn.icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {roomMessages.length === 0 ? (
              <div className="text-center py-12 text-text-muted">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30 text-text-subtle" />
                <p className="font-semibold text-sm">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              roomMessages.map((msg, i) => {
                const isOwn = msg.senderId === user.id
                const showAvatar = i === 0 || roomMessages[i - 1].senderId !== msg.senderId
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn('flex items-end gap-3', isOwn && 'flex-row-reverse')}
                  >
                    {!isOwn && (
                      <div className="w-8 h-8 rounded-full avatar flex items-center justify-center text-xs font-bold flex-shrink-0 uppercase font-sans" style={{ visibility: showAvatar ? 'visible' : 'hidden' }}>
                        {getInitials(msg.senderName)}
                      </div>
                    )}
                    <div className={cn('max-w-[70%] group')}>
                      {showAvatar && !isOwn && (
                        <div className="flex items-center gap-2 mb-1.5 font-semibold">
                          <span className="text-xs font-bold text-text">{msg.senderName}</span>
                          <span className="text-[10px] text-text-muted">{formatRelativeTime(msg.timestamp)}</span>
                        </div>
                      )}
                      <div className={cn(
                        'px-4 py-2 rounded-2xl text-sm leading-relaxed shadow-none font-medium',
                        isOwn ? 'bg-primary text-white rounded-br-sm' : 'bg-surface-2 text-text rounded-bl-sm border border-border'
                      )}>
                        {msg.content}
                      </div>
                      {isOwn && (
                        <p className="text-[10px] text-text-muted font-bold mt-1 text-right">{formatRelativeTime(msg.timestamp)}</p>
                      )}
                    </div>
                  </motion.div>
                )
              })
            )}

            {/* Typing indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-end gap-3">
                  <div className="w-8 h-8 rounded-full avatar flex items-center justify-center text-xs font-bold flex-shrink-0">J</div>
                  <div className="bg-surface-2 border border-border rounded-2xl rounded-bl-sm px-4 py-2.5 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-text-subtle animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-text-subtle animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-text-subtle animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-5 py-4 border-t border-border bg-surface">
            <div className="flex items-end gap-3">
              <button className="p-2 text-text-muted hover:text-text rounded-lg hover:bg-surface-2 transition-all flex-shrink-0 border-0 bg-transparent cursor-pointer">
                <Paperclip className="w-5 h-5" />
              </button>
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                  placeholder={`Message ${activeRoom.name}...`}
                  rows={1}
                  className="form-input pr-12 resize-none max-h-32 overflow-y-auto"
                />
                <button className="absolute right-3.5 bottom-3 text-text-muted hover:text-text transition-all border-0 bg-transparent cursor-pointer">
                  <Smile className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className={cn('p-2.5 rounded-xl transition-all flex-shrink-0 border-0 cursor-pointer', input.trim() ? 'bg-primary text-white hover:opacity-90' : 'bg-surface-2 text-text-subtle cursor-not-allowed')}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      <AnimatePresence>
        {isAddContactOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="text-lg font-bold text-text">New Message</h3>
                <button onClick={() => setIsAddContactOpen(false)} className="p-1 text-text-muted hover:text-text rounded-lg hover:bg-surface-2 transition-colors border-0 bg-transparent cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchContact}
                    onChange={(e) => setSearchContact(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-surface-2 border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto p-2">
                {availableUsers
                  .filter(u => u.name.toLowerCase().includes(searchContact.toLowerCase()))
                  .map(u => (
                  <button
                    key={u.id}
                    onClick={async () => {
                      const newRoom = await createChatRoom(u.name, 'dm', [user.id, u.id]);
                      if (newRoom) {
                        setRooms(prev => [newRoom, ...prev])
                        setActiveRoom(newRoom)
                        setIsAddContactOpen(false)
                        setSearchContact('')
                      }
                    }}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-surface-2 text-left transition-colors border-0 bg-transparent cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full avatar flex items-center justify-center text-xs font-bold uppercase">
                      {getInitials(u.name)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text">{u.name}</p>
                      <p className="text-xs text-text-muted">{u.role}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
