import { useState, useEffect } from 'react'
import { getForYouFeed, getFollowingFeed, getTrendingFeed, getExploreFeed } from '../services/postService'
import CreatePost from '../components/posts/CreatePost'
import PostCard from '../components/posts/PostCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import { ghostBtn, tabsContainer, tab, tabActive } from '../styles/common'

const Home = () => {
  const [activeTab, setActiveTab] = useState('for-you')
  const [posts, setPosts] = useState([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const fetchFeed = async (pageNum = 0, append = false) => {
    try {
      const getFeedFn = {
        'for-you': getForYouFeed,
        'following': getFollowingFeed,
        'trending': getTrendingFeed,
        'explore': getExploreFeed,
      }[activeTab] || getForYouFeed

      const { data } = await getFeedFn(pageNum)
      setPosts((prev) => append ? [...prev, ...data.payload] : data.payload)
      setHasMore(data.hasMore)
    } catch {
      // Handled globally
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // Refetch when tab changes
  useEffect(() => {
    setLoading(true)
    setPage(0)
    fetchFeed(0, false)
  }, [activeTab])

  const loadMore = () => {
    setLoadingMore(true)
    const nextPage = page + 1
    setPage(nextPage)
    fetchFeed(nextPage, true)
  }

  const handlePostCreated = (newPost) => {
    if (activeTab === 'for-you' || activeTab === 'following') {
      setPosts([newPost, ...posts])
    }
  }

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter((p) => p._id !== postId))
  }

  const tabList = [
    { id: 'for-you', label: 'For You' },
    { id: 'following', label: 'Following' },
    { id: 'trending', label: 'Trending' },
    { id: 'explore', label: 'Explore' },
  ]

  return (
    <div>
      {/* Composer with editorial breathing room */}
      <div className="mb-6">
        <CreatePost onPostCreated={handlePostCreated} />
      </div>

      {/* Navigation tabs */}
      <div className={tabsContainer}>
        {tabList.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={activeTab === t.id ? tabActive : tab}
          >
            {t.label}
          </button>
        ))}
      </div>

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
            <div className="text-center py-10">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className={`${ghostBtn} px-8 py-3`}
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

