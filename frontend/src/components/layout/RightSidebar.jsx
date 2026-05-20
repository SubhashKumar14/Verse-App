import { useState, useEffect } from 'react'
import { searchUsers } from '../../services/userService'
import UserCard from '../users/UserCard'
import LoadingSpinner from '../common/LoadingSpinner'
import { mutedText, sectionLabel, topicPill } from '../../styles/common'

const trendingTopics = [
  '#buildinpublic',
  '#devlife',
  '#writing',
  '#opensource',
  '#design',
  '#indie',
]

const RightSidebar = () => {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const { data } = await searchUsers('')
        setRecommendations(data.payload.slice(0, 4))
      } catch {
        // silently fail — sidebar is non-critical
      } finally {
        setLoading(false)
      }
    }
    fetchRecommendations()
  }, [])

  return (
    <aside className="w-full space-y-8" aria-label="Discover on VerseLy">
      {/* Trending */}
      <section>
        <p className={`${sectionLabel} px-1 mb-3`}>Trending</p>
        <div className="flex flex-wrap gap-2 px-1">
          {trendingTopics.map((topic) => (
            <span key={topic} className={topicPill}>
              {topic}
            </span>
          ))}
        </div>
      </section>

      {/* Writers */}
      <section>
        <p className={`${sectionLabel} px-1 mb-3`}>Writers</p>
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
          VerseLy — A calmer place for thoughtful writing.
        </p>
      </section>
    </aside>
  )
}

export default RightSidebar
