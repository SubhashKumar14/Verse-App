import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { likePost, softDeletePost } from '../../services/postService'
import { HiHeart, HiOutlineHeart, HiChat, HiTrash } from 'react-icons/hi'
import {
  postCard, postAuthorRow, postAvatar, postUsername, postTime,
  postContent, postActions, postActionBtn, postActionBtnActive
} from '../../styles/common'
import toast from 'react-hot-toast'

const formatTime = (date) => {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d`
  return new Date(date).toLocaleDateString()
}

const PostCard = ({ post, onDelete, showLink = true }) => {
  const { user } = useAuth()
  const [liked, setLiked] = useState(post.likes?.includes(user?._id))
  const [likesCount, setLikesCount] = useState(post.likesCount || post.likes?.length || 0)
  const [deleting, setDeleting] = useState(false)

  const author = post.author || {}
  const isOwner = user?._id === (author._id || author)

  const handleLike = async () => {
    setLiked(!liked)
    setLikesCount((c) => liked ? c - 1 : c + 1)
    try {
      await likePost(post._id)
    } catch {
      setLiked(liked)
      setLikesCount(likesCount)
      toast.error('Failed to like post')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Archive this post?')) return
    setDeleting(true)
    try {
      await softDeletePost(post._id)
      toast.success('Post archived')
      onDelete?.(post._id)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete')
      setDeleting(false)
    }
  }

  return (
    <div className={`${postCard} group`}>
      {/* Author row — avatar, username · time inline */}
      <div className={postAuthorRow}>
        <Link to={`/profile/${author._id}`} className={postAvatar} aria-label={`${author.username}'s profile`}>
          {author.username?.charAt(0).toUpperCase()}
        </Link>
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <Link to={`/profile/${author._id}`} className={postUsername}>
            {author.username}
          </Link>
          <span className="text-[var(--muted)] text-xs select-none">·</span>
          <span className={postTime}>{formatTime(post.createdAt)}</span>
        </div>
        {isOwner && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            aria-label="Archive post"
            className="text-[var(--muted)] hover:text-[var(--danger)] transition-all duration-200 cursor-pointer p-1.5 rounded-lg -mr-1 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
          >
            <HiTrash className="text-[15px]" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="mb-4">
        {showLink ? (
          <Link to={`/post/${post._id}`}>
            <p className={postContent}>{post.content}</p>
          </Link>
        ) : (
          <p className={postContent}>{post.content}</p>
        )}

        {/* Attached Image — borderless, rounded-xl */}
        {post.imageUrl && (
          <div className="mt-4">
            {showLink ? (
              <Link to={`/post/${post._id}`}>
                <img src={post.imageUrl} alt="Post attachment" className="rounded-xl w-full object-cover max-h-[500px]" />
              </Link>
            ) : (
              <img src={post.imageUrl} alt="Post attachment" className="rounded-xl w-full object-cover max-h-[500px]" />
            )}
          </div>
        )}
      </div>

      {/* Actions — no top border, just spacing */}
      <div className={postActions}>
        <button
          onClick={handleLike}
          aria-pressed={liked}
          aria-label={liked ? 'Unlike post' : 'Like post'}
          className={liked ? postActionBtnActive : postActionBtn}
        >
          {liked ? <HiHeart className="text-[15px]" /> : <HiOutlineHeart className="text-[15px]" />}
          <span>{likesCount}</span>
        </button>
        <Link to={`/post/${post._id}`} className={postActionBtn} aria-label="View comments">
          <HiChat className="text-[15px]" />
          <span>{post.commentsCount || 0}</span>
        </Link>
      </div>
    </div>
  )
}

export default PostCard
