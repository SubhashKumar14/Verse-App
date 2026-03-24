import { useState, useEffect } from 'react'
import { getArchivedPosts, restorePost } from '../services/postService'
import { getArchivedComments, restoreComment } from '../services/commentService'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import { HiRefresh } from 'react-icons/hi'
import {
  pageTitleClass, tabsContainer, tab, tabActive,
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
      <h1 className={pageTitleClass}>Archives</h1>
      <p className={`${mutedText} mb-4`}>Your soft-deleted posts and comments. Restore them anytime.</p>

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
          <EmptyState icon="📦" message="No archived posts" />
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post._id} className={archiveCard}>
                <p className={postContent}>{post.content}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className={mutedText}>
                    Deleted {new Date(post.updatedAt).toLocaleDateString()}
                  </span>
                  <button onClick={() => handleRestorePost(post._id)} className={restoreBtn}>
                    <HiRefresh className="inline mr-1" />
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
          <EmptyState icon="💬" message="No archived comments" />
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment._id} className={archiveCard}>
                <p className="text-gray-300 text-sm">{comment.text}</p>
                {comment.post && (
                  <p className={`${mutedText} mt-1`}>
                    On: "{comment.post.content?.substring(0, 60)}..."
                  </p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <span className={mutedText}>
                    Deleted {new Date(comment.updatedAt).toLocaleDateString()}
                  </span>
                  <button onClick={() => handleRestoreComment(comment._id)} className={restoreBtn}>
                    <HiRefresh className="inline mr-1" />
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
