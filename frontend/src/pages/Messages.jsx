/**
 * frontend/src/pages/Messages.jsx
 *
 * Messages / DM inbox.
 * Responsive split-pane layout:
 * - Left Pane: Search people to message & Active conversation list.
 * - Right Pane: Message scroll area & input field.
 * Integrates periodic polling for a real-time experience.
 */
import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getConversations, getMessages, sendMessage } from '../services/messageService'
import { searchUsers, getUser } from '../services/userService'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/common/Avatar'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import { HiArrowLeft, HiPaperAirplane, HiSearch, HiMail } from 'react-icons/hi'
import {
  inputClass, primaryBtn, mutedText, bodyText
} from '../styles/common'
import toast from 'react-hot-toast'

const Messages = () => {
  const { chatUserId } = useParams()
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()

  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [activeChatUser, setActiveChatUser] = useState(null)

  const [text, setText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])

  const [loadingConvs, setLoadingConvs] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)

  const messageEndRef = useRef(null)
  const pollIntervalRef = useRef(null)
  const convPollIntervalRef = useRef(null)

  // Scroll to bottom helper
  const scrollToBottom = (behavior = 'smooth') => {
    messageEndRef.current?.scrollIntoView({ behavior })
  }

  // Load conversations once, then poll
  const loadConversations = async (showLoading = false) => {
    if (showLoading) setLoadingConvs(true)
    try {
      const { data } = await getConversations()
      setConversations(data.payload || [])
    } catch {
      // Fail silently for background polling
    } finally {
      if (showLoading) setLoadingConvs(false)
    }
  }

  // Load messages for specific user, then poll
  const loadMessages = async (userId, showLoading = false) => {
    if (!userId) return
    if (showLoading) setLoadingMessages(true)
    try {
      const { data } = await getMessages(userId)
      setMessages(data.payload || [])
      
      // If we are opening a chat, mark read locally by refreshing conversations list
      loadConversations(false)
    } catch {
      // Fail silently for background polling
    } finally {
      if (showLoading) setLoadingMessages(false)
    }
  }

  // Search users helper
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const { data } = await searchUsers(searchQuery)
        // Exclude current user from search
        setSearchResults(data.payload.filter(u => u._id !== currentUser?._id))
      } catch {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(delayDebounce)
  }, [searchQuery, currentUser])

  // Setup initial conversations load and polling
  useEffect(() => {
    loadConversations(true)

    convPollIntervalRef.current = setInterval(() => {
      loadConversations(false)
    }, 8000)

    return () => {
      if (convPollIntervalRef.current) clearInterval(convPollIntervalRef.current)
    }
  }, [])

  // Handle active chat changes, load messages, setup message polling
  useEffect(() => {
    if (!chatUserId) {
      setMessages([])
      setActiveChatUser(null)
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
      return
    }

    // Fetch details of user directly to ensure we have username/avatar
    const fetchChatUser = async () => {
      try {
        const { data } = await getUser(chatUserId)
        setActiveChatUser(data.payload)
      } catch {
        setActiveChatUser({ _id: chatUserId, username: 'User' })
      }
    }
    fetchChatUser()

    // Load messages and scroll to bottom
    loadMessages(chatUserId, true).then(() => {
      setTimeout(() => scrollToBottom('instant'), 100)
    })

    // Setup polling for the active message thread
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    pollIntervalRef.current = setInterval(() => {
      // Only poll if window is in focus
      if (document.hasFocus()) {
        loadMessages(chatUserId, false)
      }
    }, 4000)

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    }
  }, [chatUserId])

  // Scroll to bottom when messages array length changes
  useEffect(() => {
    scrollToBottom('smooth')
  }, [messages.length])

  // Send message
  const handleSend = async (e) => {
    e.preventDefault()
    if (!text.trim() || !chatUserId || sending) return

    const messageText = text.trim()
    setText('')
    setSending(true)

    // Optimistic UI update
    const optimisticMessage = {
      _id: `temp-${Date.now()}`,
      sender: {
        _id: currentUser._id,
        username: currentUser.username,
        profilePicture: currentUser.profilePicture
      },
      recipient: chatUserId,
      text: messageText,
      createdAt: new Date().toISOString(),
      isRead: false
    }
    setMessages(prev => [...prev, optimisticMessage])

    try {
      const { data } = await sendMessage(chatUserId, messageText)
      // Replace optimistic message with actual DB message
      setMessages(prev => prev.map(m => m._id === optimisticMessage._id ? data.payload : m))
      // Update conversations list right away to show latest message
      loadConversations(false)
    } catch {
      toast.error('Failed to send message')
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m._id !== optimisticMessage._id))
    } finally {
      setSending(false)
    }
  }

  // Helper to start chat with user from search results
  const startChat = (user) => {
    setSearchQuery('')
    setSearchResults([])
    navigate(`/messages/${user._id}`)
  }

  // Format message time
  const formatTime = (isoString) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDividerDate = (isoString) => {
    const date = new Date(isoString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  // Show conversation list on mobile only when no chatUserId selected
  const hideListOnMobile = chatUserId ? 'hidden md:flex' : 'flex'
  const hideChatOnMobile = chatUserId ? 'flex' : 'hidden md:flex'

  return (
    <div className="flex h-[calc(100vh-9rem)] md:h-[calc(100vh-4rem)] border border-[var(--border)] rounded-xl bg-[var(--surface)] overflow-hidden">
      
      {/* ─── LEFT COLUMN: CONVERSATIONS LIST ─── */}
      <div className={`${hideListOnMobile} w-full md:w-80 border-r border-[var(--border)] flex-col bg-[var(--surface)] h-full`}>
        {/* Header with Search */}
        <div className="p-4 border-b border-[var(--border)] shrink-0">
          <h1 className="text-xl font-bold tracking-tight text-[var(--text)] mb-3 font-[family-name:var(--font-heading)]">Messages</h1>
          <div className="relative">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] text-md" />
            <input
              type="text"
              placeholder="Search people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${inputClass} pl-9 pr-4 py-2 text-xs`}
            />
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {searchQuery.trim() ? (
            /* Search Results */
            <div className="p-2 space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)] px-3 py-1">Search Results</p>
              {searchResults.length === 0 ? (
                <p className="text-xs text-[var(--muted)] text-center py-4">No people found</p>
              ) : (
                searchResults.map(u => (
                  <button
                    key={u._id}
                    onClick={() => startChat(u)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-[var(--surface-2)] transition-colors text-left"
                  >
                    <Avatar src={u.profilePicture} name={u.username} sizeClassName="w-9 h-9" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[var(--text)] truncate">@{u.username}</p>
                      {u.bio && <p className="text-[11px] text-[var(--muted)] truncate">{u.bio}</p>}
                    </div>
                  </button>
                ))
              )}
            </div>
          ) : (
            /* Conversation List */
            <div className="p-2 space-y-0.5">
              {loadingConvs ? (
                <div className="py-12"><LoadingSpinner /></div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="text-2xl mb-2 text-[var(--accent)] opacity-40">
                    <HiMail className="mx-auto" />
                  </div>
                  <p className="text-xs text-[var(--muted)] font-medium leading-relaxed">
                    No conversations yet.<br />Search above to start chatting!
                  </p>
                </div>
              ) : (
                conversations.map(conv => {
                  const isActive = conv.otherUser._id === chatUserId
                  const isUnread = conv.unreadCount > 0
                  return (
                    <Link
                      to={`/messages/${conv.otherUser._id}`}
                      key={conv.otherUser._id}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-150 ${
                        isActive 
                          ? 'bg-[var(--accent-soft)] border border-[var(--accent-border)]' 
                          : 'hover:bg-[var(--surface-2)] border border-transparent'
                      }`}
                    >
                      <Avatar src={conv.otherUser.profilePicture} name={conv.otherUser.username} sizeClassName="w-10 h-10 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <span className={`text-xs truncate ${isUnread ? 'font-bold text-[var(--text)]' : 'font-medium text-[var(--text)]'}`}>
                            @{conv.otherUser.username}
                          </span>
                          <span className="text-[10px] text-[var(--muted)] font-mono shrink-0">
                            {formatDividerDate(conv.lastMessage.createdAt)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <p className={`text-[12px] truncate ${isUnread ? 'font-semibold text-[var(--text)]' : 'text-[var(--muted)]'}`}>
                            {conv.lastMessage.sender === currentUser._id && 'You: '}{conv.lastMessage.text}
                          </p>
                          {isUnread && (
                            <span className="bg-[var(--accent)] text-[var(--accent-ink)] text-[10px] font-bold h-4 min-w-4 px-1 flex items-center justify-center rounded-full shrink-0">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── RIGHT COLUMN: ACTIVE CONVERSATION THREAD ─── */}
      <div className={`${hideChatOnMobile} flex-1 flex flex-col bg-[var(--surface-2)]/30 h-full`}>
        {chatUserId ? (
          <>
            {/* Thread Header */}
            <div className="bg-[var(--surface)] px-4 py-3 border-b border-[var(--border)] flex items-center gap-3 shrink-0">
              <Link to="/messages" className="md:hidden p-1.5 rounded-lg text-[var(--muted)] hover:bg-[var(--surface-2)]">
                <HiArrowLeft className="text-lg" />
              </Link>
              {activeChatUser && (
                <Link to={`/profile/${activeChatUser._id}`} className="flex items-center gap-2.5 hover:opacity-85 transition-opacity">
                  <Avatar src={activeChatUser.profilePicture} name={activeChatUser.username} sizeClassName="w-8 h-8" />
                  <div>
                    <h2 className="text-xs font-bold text-[var(--text)]">@{activeChatUser.username}</h2>
                    <span className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-semibold">View Profile</span>
                  </div>
                </Link>
              )}
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col no-scrollbar">
              {loadingMessages ? (
                <div className="m-auto"><LoadingSpinner /></div>
              ) : messages.length === 0 ? (
                <div className="m-auto text-center p-6">
                  <span className="text-2xl mb-2 inline-block opacity-45">✨</span>
                  <p className="text-xs text-[var(--muted)]">Send a message to start the conversation.</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = msg.sender._id === currentUser?._id || msg.sender === currentUser?._id
                  const prevMsg = index > 0 ? messages[index - 1] : null
                  const showDateDivider = !prevMsg || 
                    new Date(msg.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString()

                  return (
                    <div key={msg._id} className="w-full flex flex-col">
                      {showDateDivider && (
                        <div className="text-center my-4 shrink-0">
                          <span className="text-[10px] uppercase tracking-wider font-bold bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] px-2.5 py-0.5 rounded-full font-mono">
                            {formatDividerDate(msg.createdAt)}
                          </span>
                        </div>
                      )}
                      
                      <div className={`flex flex-col max-w-[75%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                        {/* Bubble */}
                        <div className={`px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed shadow-sm break-words border ${
                          isMe 
                            ? 'bg-[var(--accent)] text-[var(--accent-ink)] border-[var(--accent-border)] rounded-tr-sm' 
                            : 'bg-[var(--surface)] text-[var(--text)] border-[var(--border)] rounded-tl-sm'
                        }`}>
                          <p>{msg.text}</p>
                        </div>
                        {/* Time label */}
                        <span className="text-[9px] text-[var(--muted)] mt-1 font-mono tabular-nums px-1">
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messageEndRef} />
            </div>

            {/* Input Composer */}
            <form onSubmit={handleSend} className="bg-[var(--surface)] p-3 border-t border-[var(--border)] flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={`Message @${activeChatUser?.username || 'user'}...`}
                disabled={sending}
                className={`${inputClass} flex-1 text-xs py-2.5 px-4`}
              />
              <button
                type="submit"
                disabled={!text.trim() || sending}
                className={`${primaryBtn} py-2.5 px-3 shrink-0 rounded-lg`}
                aria-label="Send message"
              >
                <HiPaperAirplane className="rotate-90 text-sm" />
              </button>
            </form>
          </>
        ) : (
          /* Select convo empty state */
          <div className="m-auto text-center p-8 max-w-sm">
            <div className="text-4xl mb-3 text-[var(--accent)] opacity-40">
              <HiMail className="mx-auto" />
            </div>
            <h3 className="text-md font-bold text-[var(--text)] mb-1 font-[family-name:var(--font-heading)]">Your Messages</h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Select an existing chat from the left side pane or search for users to start a new private conversation thread.
            </p>
          </div>
        )}
      </div>

    </div>
  )
}

export default Messages
