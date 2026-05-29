/**
 * frontend/src/components/layout/RightSidebar.jsx
 *
 * Desktop right sidebar.
 * Fetches and displays non-critical “discover” content like trending tags and
 * recommended writers.
 */
import { useState, useEffect } from 'react'
import { getTrendingTags, getRecommendedUsers } from '../../services/postService'
import UserCard from '../users/UserCard'
import LoadingSpinner from '../common/LoadingSpinner'
import { mutedText, sectionLabel, topicPill } from '../../styles/common'

const RightSidebar = () => {
  const [recommendations, setRecommendations] = useState([])
  const [trending, setTrending] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        const [tagsRes, usersRes] = await Promise.all([
          getTrendingTags(),
          getRecommendedUsers()
        ])
        setTrending(tagsRes.data.payload || [])
        setRecommendations(usersRes.data.payload || [])
      } catch {
        // silently fail — sidebar is non-critical
      } finally {
        setLoading(false)
      }
    }
    fetchSidebarData()
  }, [])

  return (
    <aside className="w-full space-y-8" aria-label="Discover on VerseLy">
      {/* Trending */}
      <section>
        <p className={`${sectionLabel} px-1 mb-3`}>Trending Tags</p>
        {loading ? (
          <div className="py-2"><LoadingSpinner size="sm" /></div>
        ) : trending.length > 0 ? (
          <div className="flex flex-wrap gap-2 px-1">
            {trending.map((topic) => {
              const tag = typeof topic === 'string' ? topic : topic.hashtag
              return (
                <span key={tag} className={topicPill}>
                  {tag}
                </span>
              )
            })}
          </div>
        ) : (
          <p className={`${mutedText} text-xs py-2 px-1`}>No trending tags today.</p>
        )}
      </section>

      {/* Writers */}
      <section>
        <p className={`${sectionLabel} px-1 mb-3`}>Recommended Writers</p>
        {loading ? (
          <div className="py-4"><LoadingSpinner size="sm" /></div>
        ) : recommendations.length > 0 ? (
          <div className="space-y-0.5">
            {recommendations.map(user => (
              <UserCard key={user._id} userData={user} />
            ))}
          </div>
        ) : (
          <p className={`${mutedText} text-xs py-2 px-1`}>No one to suggest right now.</p>
        )}
      </section>

      {/* About */}
      <section className="px-1 pt-2 border-t border-[var(--border)]">
        <p className={`${mutedText} text-xs leading-relaxed`}>
          Verse — A personalized social experience.
        </p>
      </section>
    </aside>
  )
}

export default RightSidebar

