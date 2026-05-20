import { useState, useEffect } from 'react'
import { searchUsers } from '../../services/userService'
import UserCard from '../users/UserCard'
import LoadingSpinner from '../common/LoadingSpinner'
import { mutedText } from '../../styles/common'

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
    <aside className="w-full" aria-label="People on VerseLy">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-[color:var(--muted)] px-1 mb-3">
        People writing
      </p>

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
    </aside>
  )
}

export default RightSidebar
