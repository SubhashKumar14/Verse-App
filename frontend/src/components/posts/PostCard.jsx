/**
 * frontend/src/components/posts/PostCard.jsx
 *
 * Feed item renderer for a single post.
 * Handles optimistic like toggling, repost toggling, archive (soft delete)
 * for the owner, and links to the post detail page.
 * Hashtags in content are rendered as clickable links to search.
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { likePost, softDeletePost, repostPost } from '../../services/postService'
import { HiHeart, HiOutlineHeart, HiChat, HiTrash } from 'react-icons/hi'
import { HiArrowPath } from 'react-icons/hi2'
import {
  postCard, postAuthorRow, postUsername, postTime,
  postContent, postActions, postActionBtn, postActionBtnActive
} from '../../styles/common'
import toast from 'react-hot-toast'
import Avatar from '../common/Avatar'

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

/**
 * Render post content with clickable hashtags.
 * Hashtags become links that navigate to /search?q=#hashtag
 */
const renderContentWithHashtags = (content, navigate) => {
  if (!content) return null

  const parts = content.split(/(#[a-zA-Z0-9_]+)/g)
  return parts.map((part, i) => {
    if (part.match(/^#[a-zA-Z0-9_]+$/)) {
      return (
        <span
          key={i}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            navigate(`/search?q=${encodeURIComponent(part)}`)
          }}
          className="text-[var(--accent)] hover:underline cursor-pointer font-medium"
        >
          {part}
        </span>
      )
    }
    return <span key={i}>{part}</span>
  })
}

const PostCard = ({ post, onDelete, showLink = true, repostedBy = null }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [liked, setLiked] = useState(post.isLiked || post.likes?.includes(user?._id))
  const [likesCount, setLikesCount] = useState(post.likesCount || post.likes?.length || 0)
  const [reposted, setReposted] = useState(post.isReposted || false)
  const [repostsCount, setRepostsCount] = useState(post.repostsCount || 0)
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

  const handleRepost = async () => {
    setReposted(!reposted)
    setRepostsCount((c) => reposted ? c - 1 : c + 1)
    try {
      const { data } = await repostPost(post._id)
      if (!data.reposted) {
        toast.success('Repost removed')
      } else {
        toast.success('Reposted!')
      }
    } catch {
      setReposted(reposted)
      setRepostsCount(repostsCount)
      toast.error('Failed to repost')
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
      {/* Repost indicator */}
      {repostedBy && (
        <div className="flex items-center gap-2 text-xs text-[var(--muted)] mb-2 pl-12">
          <HiArrowPath className="text-[13px]" />
          <span>{repostedBy} reposted</span>
        </div>
      )}

      {/* Author row — avatar, username · time inline */}
      <div className={postAuthorRow}>
        <Link to={`/profile/${author._id}`} aria-label={`${author.username}'s profile`} className="shrink-0">
          <Avatar
            src={author.profilePicture}
            name={author.username}
            sizeClassName="w-10 h-10"
          />
        </Link>
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <Link to={`/profile/${author._id}`} className={postUsername}>
            {author.username}
          </Link>
          <span className="text-(--muted) text-xs select-none">·</span>
          <span className={postTime}>{formatTime(post.createdAt)}</span>
        </div>
        {isOwner && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            aria-label="Archive post"
            className="text-(--muted) hover:text-(--danger) transition-all duration-200 cursor-pointer p-1.5 rounded-lg -mr-1 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
          >
            <HiTrash className="text-[15px]" />
          </button>
        )}
      </div>

      {/* Content — with clickable hashtags */}
      <div className="mb-4">
        {showLink ? (
          <Link to={`/post/${post._id}`}>
            <p className={postContent}>
              {renderContentWithHashtags(post.content, navigate)}
            </p>
          </Link>
        ) : (
          <p className={postContent}>
            {renderContentWithHashtags(post.content, navigate)}
          </p>
        )}

        {/* Attached Image — borderless, rounded-xl */}
        {post.imageUrl && (
          <div className="mt-4">
            {showLink ? (
              <Link to={`/post/${post._id}`}>
                <img src={post.imageUrl} alt="Post attachment" className="rounded-xl w-full object-cover max-h-125" />
              </Link>
            ) : (
              <img src={post.imageUrl} alt="Post attachment" className="rounded-xl w-full object-cover max-h-125" />
            )}
          </div>
        )}
      </div>

      {/* Actions — like, comment, repost */}
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
        <button
          onClick={handleRepost}
          aria-pressed={reposted}
          aria-label={reposted ? 'Remove repost' : 'Repost'}
          className={reposted
            ? `${postActionBtn} text-emerald-500 font-semibold`
            : postActionBtn
          }
        >
          <HiArrowPath className="text-[15px]" />
          <span>{repostsCount}</span>
        </button>
      </div>
    </div>
  )
}

export default PostCard
