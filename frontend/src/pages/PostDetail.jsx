/**
 * frontend/src/pages/PostDetail.jsx
 *
 * Post detail page.
 * Loads a single post by id and renders the full post plus its comment thread.
 */
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPost } from '../services/postService'
import PostCard from '../components/posts/PostCard'
import CommentSection from '../components/posts/CommentSection'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import { ghostBtn } from '../styles/common'
import { HiArrowLeft } from 'react-icons/hi'

const PostDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await getPost(id)
        setPost(data.payload)
      } catch { /* handled globally */ } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [id])

  if (loading) return <LoadingSpinner />
  if (!post) return <EmptyState icon="✦" message="Post not found" />

  return (
    <div>
      {/* Back button — breadcrumb feel */}
      <button
        onClick={() => navigate(-1)}
        className={`${ghostBtn} mb-6 gap-1.5 -ml-1`}
        aria-label="Go back"
      >
        <HiArrowLeft className="text-sm" />
        <span>Back</span>
      </button>

      <PostCard post={post} showLink={false} />
      <div className="mt-8">
        <CommentSection postId={post._id} />
      </div>
    </div>
  )
}

export default PostDetail
