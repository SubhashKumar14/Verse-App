import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getPost } from '../services/postService'
import PostCard from '../components/posts/PostCard'
import CommentSection from '../components/posts/CommentSection'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import { pageTitleClass, cardClass } from '../styles/common'

const PostDetail = () => {
  const { id } = useParams()
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
      <h1 className={`${pageTitleClass} text-xl`}>Post</h1>
      <PostCard post={post} showLink={false} />
      <div className="mt-6">
        <CommentSection postId={post._id} />
      </div>
    </div>
  )
}

export default PostDetail
