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
    if (!confirm('Move this post to archive?')) return
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
    <div className={postCard}>
      {/* Author row */}
      <div className={postAuthorRow}>
        <Link to={`/profile/${author._id}`} className={postAvatar}>
          {author.username?.charAt(0).toUpperCase()}
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={`/profile/${author._id}`} className={postUsername}>
            {author.username}
          </Link>
          <p className={postTime}>{formatTime(post.createdAt)}</p>
        </div>
        {isOwner && (
          <button onClick={handleDelete} disabled={deleting} className="text-gray-600 hover:text-red-400 transition-colors cursor-pointer p-1">
            <HiTrash className="text-lg" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="mb-3">
        {showLink ? (
          <Link to={`/post/${post._id}`}>
            <p className={postContent}>{post.content}</p>
          </Link>
        ) : (
          <p className={postContent}>{post.content}</p>
        )}
        
        {/* Attached Image */}
        {post.imageUrl && (
          <div className="mt-3">
            {showLink ? (
              <Link to={`/post/${post._id}`}>
                <img src={post.imageUrl} alt="Post attachment" className="rounded-xl border border-gray-200 dark:border-gray-800/80 w-full object-cover max-h-[500px]" />
              </Link>
            ) : (
              <img src={post.imageUrl} alt="Post attachment" className="rounded-xl border border-gray-200 dark:border-gray-800/80 w-full object-cover max-h-[500px]" />
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className={postActions}>
        <button onClick={handleLike} className={liked ? postActionBtnActive : postActionBtn}>
          {liked ? <HiHeart className="text-lg" /> : <HiOutlineHeart className="text-lg" />}
          <span>{likesCount}</span>
        </button>
        <Link to={`/post/${post._id}`} className={postActionBtn}>
          <HiChat className="text-lg" />
          <span>{post.commentsCount || 0}</span>
        </Link>
      </div>
    </div>
  )
}

export default PostCard
