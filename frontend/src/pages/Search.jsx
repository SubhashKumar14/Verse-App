/**
 * frontend/src/pages/Search.jsx
 *
 * Explore/search page.
 * Searches for posts, hashtags, and users — with posts prioritized.
 * Supports hashtag search (#react) returning post results with highlighted tags.
 * Shows live trending topics from the trending API.
 */
import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { searchAll, getTrendingTags } from '../services/postService'
import { searchUsers } from '../services/userService'
import PostCard from '../components/posts/PostCard'
import UserCard from '../components/users/UserCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import { HiSearch } from 'react-icons/hi'
import {
  pageTitleClass, pageSubtitle, sectionLabel, topicPill, tabsContainer, tab, tabActive
} from '../styles/common'

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const query = searchParams.get('q') || ''
  const activeType = searchParams.get('type') || 'all'
  const [searchInput, setSearchInput] = useState(query)
  const [results, setResults] = useState({ posts: [], hashtags: [], users: [] })
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [trendingTopics, setTrendingTopics] = useState([])
  const [trendingLoading, setTrendingLoading] = useState(true)

  // Fetch live trending topics on mount
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const { data } = await getTrendingTags()
        setTrendingTopics(data.payload || [])
      } catch {
        setTrendingTopics([])
      } finally {
        setTrendingLoading(false)
      }
    }
    fetchTrending()
  }, [])

  // Run search when query changes
  useEffect(() => {
    if (!query) {
      setSearched(false)
      return
    }
    const doSearch = async () => {
      setLoading(true)
      setSearched(true)
      try {
        const { data } = await searchAll(query)
        setResults(data.payload || { posts: [], hashtags: [], users: [] })
      } catch {
        setResults({ posts: [], hashtags: [], users: [] })
      } finally {
        setLoading(false)
      }
    }
    doSearch()
  }, [query])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() })
    }
  }

  const handleHashtagClick = (hashtag) => {
    const tag = hashtag.startsWith('#') ? hashtag : `#${hashtag}`
    setSearchInput(tag)
    setSearchParams({ q: tag })
  }

  const setType = (type) => {
    const params = { q: query }
    if (type !== 'all') params.type = type
    setSearchParams(params)
  }

  const totalResults = results.posts.length + results.hashtags.length + results.users.length

  // Filter results by active tab
  const showPosts = activeType === 'all' || activeType === 'posts'
  const showHashtags = activeType === 'all' || activeType === 'hashtags'
  const showUsers = activeType === 'all' || activeType === 'users'

  return (
    <div>
      <h1 className={`${pageTitleClass} [text-wrap:balance]`}>Explore</h1>
      <p className={`${pageSubtitle} mb-8`}>Discover posts, hashtags, and writers</p>

      {/* Search input — bottom border only, editorial */}
      <form onSubmit={handleSearch} className="mb-10 relative">
        <HiSearch className="absolute left-0 top-1/2 -translate-y-1/2 text-[var(--muted)] text-xl" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search #hashtags, posts, or people..."
          className="w-full bg-transparent border-0 border-b border-[var(--border)] focus:border-[var(--accent)] focus:outline-none focus:ring-0 pl-8 pr-4 py-3 text-lg text-[var(--text)] placeholder-[var(--muted)] transition-colors duration-200"
        />
      </form>

      {/* Trending topics — live from API */}
      {!searched && (
        <div className="mb-10">
          <p className={`${sectionLabel} mb-4`}>Trending</p>
          {trendingLoading ? (
            <div className="flex gap-2 flex-wrap">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-8 w-24 rounded-full bg-[var(--surface-2)] animate-pulse" />
              ))}
            </div>
          ) : trendingTopics.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {trendingTopics.map((topic) => (
                <button
                  key={topic.hashtag || topic}
                  onClick={() => handleHashtagClick(topic.hashtag || topic)}
                  className={topicPill}
                >
                  <span>#{typeof topic === 'string' ? topic : topic.hashtag?.replace(/^#/, '')}</span>
                  {topic.postsCount && (
                    <span className="text-[var(--muted)] text-[11px] ml-1">
                      {topic.postsCount} posts
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--muted)]">No trending topics right now</p>
          )}
        </div>
      )}

      {/* Results tabs — only show when we have search results */}
      {searched && !loading && totalResults > 0 && (
        <div className={`${tabsContainer} mb-6`}>
          <button
            onClick={() => setType('all')}
            className={activeType === 'all' ? tabActive : tab}
          >
            All
          </button>
          <button
            onClick={() => setType('posts')}
            className={activeType === 'posts' ? tabActive : tab}
          >
            Posts {results.posts.length > 0 && `(${results.posts.length})`}
          </button>
          <button
            onClick={() => setType('hashtags')}
            className={activeType === 'hashtags' ? tabActive : tab}
          >
            Hashtags {results.hashtags.length > 0 && `(${results.hashtags.length})`}
          </button>
          <button
            onClick={() => setType('users')}
            className={activeType === 'users' ? tabActive : tab}
          >
            People {results.users.length > 0 && `(${results.users.length})`}
          </button>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <LoadingSpinner />
      ) : searched && totalResults > 0 ? (
        <div className="space-y-6">
          {/* Posts section — always first */}
          {showPosts && results.posts.length > 0 && (
            <div>
              {activeType === 'all' && (
                <p className={`${sectionLabel} px-1 mb-3`}>Posts</p>
              )}
              <div className="space-y-0">
                {results.posts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            </div>
          )}

          {/* Trending hashtags section */}
          {showHashtags && results.hashtags.length > 0 && (
            <div>
              {activeType === 'all' && (
                <p className={`${sectionLabel} px-1 mb-3`}>Hashtags</p>
              )}
              <div className="space-y-2">
                {results.hashtags.map((tag) => (
                  <button
                    key={tag.hashtag}
                    onClick={() => handleHashtagClick(tag.hashtag)}
                    className="w-full text-left px-4 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[var(--text)] font-semibold text-sm group-hover:text-[var(--accent)] transition-colors">
                          #{tag.hashtag?.replace(/^#/, '')}
                        </p>
                        {tag.samplePost && (
                          <p className="text-[var(--muted)] text-xs mt-0.5 line-clamp-1">
                            {tag.samplePost}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className="text-xs text-[var(--muted)]">
                          {tag.postsCount} {tag.postsCount === 1 ? 'post' : 'posts'}
                        </p>
                        {tag.totalEngagement > 0 && (
                          <p className="text-[10px] text-[var(--muted)]">
                            {tag.totalEngagement} engagements
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Users section — last */}
          {showUsers && results.users.length > 0 && (
            <div>
              {activeType === 'all' && (
                <p className={`${sectionLabel} px-1 mb-3`}>People</p>
              )}
              <div className="space-y-0.5">
                {results.users.map((u) => (
                  <UserCard key={u._id} userData={u} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : searched ? (
        <EmptyState icon="✦" message={`No results for "${query}"`} />
      ) : (
        <EmptyState icon="✦" message="Search for hashtags, posts, or people." />
      )}
    </div>
  )
}

export default Search
