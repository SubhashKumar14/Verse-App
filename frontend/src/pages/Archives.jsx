import { useState, useEffect } from 'react'
import { getArchivedPosts, restorePost } from '../services/postService'
import { getArchivedComments, restoreComment } from '../services/commentService'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import { HiRefresh } from 'react-icons/hi'
import {
  pageTitleClass, pageSubtitle, tabsContainer, tab, tabActive,
  archiveCard, restoreBtn, mutedText, postContent
} from '../styles/common'
import toast from 'react-hot-toast'

const Archives = () => {
  const [activeTab, setActiveTab] = useState('posts')
  const [posts, setPosts] = useState([])
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArchives = async () => {
      setLoading(true)
      try {
        const [postsRes, commentsRes] = await Promise.all([
          getArchivedPosts(),
          getArchivedComments(),
        ])
        setPosts(postsRes.data.payload)
        setComments(commentsRes.data.payload)
      } catch {
        toast.error('Failed to load archives')
      } finally {
        setLoading(false)
      }
    }
    fetchArchives()
  }, [])

  const handleRestorePost = async (postId) => {
    try {
      await restorePost(postId)
      setPosts(posts.filter((p) => p._id !== postId))
      toast.success('Post restored!')
    } catch {
      toast.error('Failed to restore post')
    }
  }

  const handleRestoreComment = async (commentId) => {
    try {
      await restoreComment(commentId)
      setComments(comments.filter((c) => c._id !== commentId))
      toast.success('Comment restored!')
    } catch {
      toast.error('Failed to restore comment')
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <h1 className={`${pageTitleClass} [text-wrap:balance]`}>Archives</h1>
      <p className={`${pageSubtitle} mb-8`}>
        Your digital memory vault. Restore thoughts anytime.
      </p>

      {/* Tabs */}
      <div className={tabsContainer}>
        <button
          onClick={() => setActiveTab('posts')}
          className={activeTab === 'posts' ? tabActive : tab}
        >
          Posts ({posts.length})
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={activeTab === 'comments' ? tabActive : tab}
        >
          Comments ({comments.length})
        </button>
      </div>

      {/* Archived Posts */}
      {activeTab === 'posts' && (
        posts.length === 0 ? (
          <EmptyState icon="✦" message="Your memory vault is empty." />
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post._id} className={archiveCard}>
                <p className={`${postContent} opacity-80`}>{post.content}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-[12px] font-medium text-[var(--muted)] tabular-nums tracking-wide">
                    Archived {new Date(post.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <button onClick={() => handleRestorePost(post._id)} aria-label="Restore post" className={restoreBtn}>
                    <HiRefresh className="text-sm" />
                    Restore
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Archived Comments */}
      {activeTab === 'comments' && (
        comments.length === 0 ? (
          <EmptyState icon="✦" message="No archived replies." />
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment._id} className={archiveCard}>
                <p className="text-[15px] text-[var(--text)] leading-relaxed opacity-80">{comment.text}</p>
                {comment.post && (
                  <p className={`${mutedText} mt-2 text-[13px] italic`}>
                    Replying to: "{comment.post.content?.substring(0, 60)}…"
                  </p>
                )}
                <div className="flex items-center justify-between mt-4">
                  <span className="text-[12px] font-medium text-[var(--muted)] tabular-nums tracking-wide">
                    Archived {new Date(comment.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <button onClick={() => handleRestoreComment(comment._id)} aria-label="Restore comment" className={restoreBtn}>
                    <HiRefresh className="text-sm" />
                    Restore
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}

export default Archives
