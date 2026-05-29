/**
 * frontend/src/pages/Notifications.jsx
 *
 * Notifications inbox.
 * Lists recent notifications for the current user and supports marking them
 * (or all of them) as read. Links back to the relevant post/profile.
 */
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getNotifications, readAllNotifications, readNotification } from '../services/notificationService'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import { HiHeart, HiChatAlt, HiUserAdd, HiCheck } from 'react-icons/hi'
import { pageTitleClass, pageSubtitle, mutedText, ghostBtn, cardHover } from '../styles/common'
import toast from 'react-hot-toast'

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = async () => {
    try {
      const { data } = await getNotifications()
      setNotifications(data.payload || [])
    } catch {
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleReadAll = async () => {
    try {
      await readAllNotifications()
      setNotifications(notifications.map(n => ({ ...n, isRead: true })))
      toast.success('All notifications marked as read')
    } catch {
      toast.error('Failed to mark all as read')
    }
  }

  const handleRead = async (id) => {
    const notif = notifications.find(n => n._id === id)
    if (notif?.isRead) return

    try {
      await readNotification(id)
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n))
    } catch {
      // fail silently
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className={`${pageTitleClass}`}>Notifications</h1>
          <p className={`${pageSubtitle}`}>
            Stay updated with your social circle's activity.
          </p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={handleReadAll}
            className={`${ghostBtn} flex items-center gap-1.5 px-3 py-1.5`}
          >
            <HiCheck className="text-lg" />
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon="✦" message="You have no notifications yet." />
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const isRead = notif.isRead
            const sender = notif.sender || { username: 'someone', profilePicture: '' }
            const post = notif.post

            let icon = <HiHeart className="text-rose-500" />
            let text = ''
            let link = '#'

            if (notif.type === 'like') {
              icon = <HiHeart className="text-rose-500" />
              text = 'liked your post'
              link = post ? `/post/${post._id}` : '#'
            } else if (notif.type === 'comment') {
              icon = <HiChatAlt className="text-sky-500" />
              text = 'replied to your post'
              link = post ? `/post/${post._id}` : '#'
            } else if (notif.type === 'follow') {
              icon = <HiUserAdd className="text-emerald-500" />
              text = 'started following you'
              link = `/profile/${sender._id}`
            }

            return (
              <Link
                to={link}
                key={notif._id}
                onClick={() => handleRead(notif._id)}
                className={`${cardHover} flex items-center gap-4 transition-all duration-200 ${
                  !isRead ? 'border-l-4 border-l-[var(--accent)] bg-[var(--surface-2)]/40' : 'opacity-85'
                }`}
              >
                <div className="text-2xl shrink-0 p-1 bg-[var(--surface-2)] rounded-lg border border-[var(--border)]">
                  {icon}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[15px] text-[var(--text)] leading-relaxed">
                    <span className="font-semibold text-[var(--text)] mr-1">
                      @{sender.username}
                    </span>
                    {text}
                  </p>
                  {post?.content && (
                    <p className={`${mutedText} text-[13px] truncate mt-1 italic pl-1 border-l border-[var(--border)] max-w-md`}>
                      "{post.content}"
                    </p>
                  )}
                  <span className={`${mutedText} text-xs mt-1 block font-mono`}>
                    {new Date(notif.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                {!isRead && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] shrink-0" />
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Notifications
