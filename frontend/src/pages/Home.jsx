import { useState, useEffect, useCallback } from 'react'
import { getFeed } from '../services/postService'
import CreatePost from '../components/posts/CreatePost'
import PostCard from '../components/posts/PostCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import { pageTitleClass } from '../styles/common'

const Home = () => {
  const [posts, setPosts] = useState([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const fetchFeed = useCallback(async (pageNum = 0, append = false) => {
    try {
      const { data } = await getFeed(pageNum)
      setPosts((prev) => append ? [...prev, ...data.payload] : data.payload)
      setHasMore(data.hasMore)
    } catch { /* handled globally */ } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => { fetchFeed() }, [fetchFeed])

  const loadMore = () => {
    setLoadingMore(true)
    const nextPage = page + 1
    setPage(nextPage)
    fetchFeed(nextPage, true)
  }

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts])
  }

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter((p) => p._id !== postId))
  }

  return (
    <div>
      <h1 className={`${pageTitleClass} [text-wrap:balance]`}>Home</h1>

      {/* Composer */}
      <CreatePost onPostCreated={handlePostCreated} />

      {/* Feed */}
      {loading ? (
        <LoadingSpinner />
      ) : posts.length === 0 ? (
        <EmptyState icon="✦" message="Nothing here yet. Write the first thing." />
      ) : (
        <div className="space-y-0">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} onDelete={handlePostDeleted} />
          ))}
          {hasMore && (
            <div className="text-center py-6">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="text-sm text-[color:var(--muted)] hover:text-[color:var(--text)] transition-colors duration-150 disabled:opacity-50"
              >
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Home
