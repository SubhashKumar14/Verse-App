import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getComments, addComment, softDeleteComment } from '../../services/commentService'
import { HiTrash } from 'react-icons/hi'
import {
  commentCard, commentAvatar, commentBody, commentUsername,
  commentText, commentTime, inputClass, primaryBtn, mutedText
} from '../../styles/common'
import toast from 'react-hot-toast'
import LoadingSpinner from '../common/LoadingSpinner'

const formatTime = (date) => {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return new Date(date).toLocaleDateString()
}

const CommentSection = ({ postId }) => {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const { data } = await getComments(postId)
        setComments(data.payload)
      } catch {
        toast.error('Failed to load comments')
      } finally {
        setLoading(false)
      }
    }
    fetchComments()
  }, [postId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setPosting(true)
    try {
      const { data } = await addComment(postId, text.trim())
      setComments([...comments, data.payload])
      setText('')
      toast.success('Comment added')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to comment')
    } finally {
      setPosting(false)
    }
  }

  const handleDelete = async (commentId) => {
    try {
      await softDeleteComment(commentId)
      setComments(comments.filter((c) => c._id !== commentId))
      toast.success('Comment deleted')
    } catch {
      toast.error('Failed to delete comment')
    }
  }

  if (loading) return <LoadingSpinner size="sm" />

  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold text-gray-400 mb-3">
        Comments ({comments.length})
      </h3>

      {/* Comment list */}
      <div className="space-y-0">
        {comments.map((c) => {
          const author = c.author || {}
          return (
            <div key={c._id} className={commentCard}>
              <div className={commentAvatar}>
                {author.username?.charAt(0).toUpperCase()}
              </div>
              <div className={commentBody}>
                <div className="flex items-center gap-2">
                  <span className={commentUsername}>{author.username}</span>
                  <span className={commentTime}>{formatTime(c.createdAt)}</span>
                </div>
                <p className={commentText}>{c.text}</p>
              </div>
              {user?._id === author._id && (
                <button onClick={() => handleDelete(c._id)} className="text-gray-600 hover:text-red-400 transition-colors cursor-pointer p-1 shrink-0">
                  <HiTrash className="text-sm" />
                </button>
              )}
            </div>
          )
        })}
        {comments.length === 0 && (
          <p className={mutedText}>No comments yet. Be the first!</p>
        )}
      </div>

      {/* Add comment */}
      <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          className={`${inputClass} text-sm`}
          maxLength={300}
        />
        <button type="submit" disabled={!text.trim() || posting} className={`${primaryBtn} text-sm whitespace-nowrap`}>
          {posting ? '...' : 'Post'}
        </button>
      </form>
    </div>
  )
}

export default CommentSection
