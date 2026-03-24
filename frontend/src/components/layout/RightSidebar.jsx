import { useState, useEffect } from 'react'
import { searchUsers } from '../../services/userService'
import UserCard from '../users/UserCard'
import LoadingSpinner from '../common/LoadingSpinner'
import { mutedText } from '../../styles/common'

const RightSidebar = () => {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch some users to display as recommendations.
    // Since there isn't a dedicated /recommendations endpoint yet,
    // we use an empty search to grab a few recent/random users.
    const fetchRecommendations = async () => {
      try {
        const { data } = await searchUsers('')
        // Take just the first 3 or 4 users
        setRecommendations(data.payload.slice(0, 4))
      } catch (error) {
        console.error('Failed to fetch recommendations', error)
      } finally {
        setLoading(false)
      }
    }
    fetchRecommendations()
  }, [])

  return (
    <aside className="w-full">
      <div className="bg-white dark:bg-[#111113] border border-gray-200 dark:border-gray-800/80 rounded-xl p-5 shadow-sm">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Who to follow</h3>
        
        {loading ? (
          <div className="py-4"><LoadingSpinner size="sm" /></div>
        ) : recommendations.length > 0 ? (
          <div className="space-y-1">
            {recommendations.map(user => (
              <UserCard key={user._id} userData={user} />
            ))}
          </div>
        ) : (
          <p className={`${mutedText} text-sm py-2`}>No recommendations right now.</p>
        )}
        
        {/* Footer links within the sidebar */}
        <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-800/80 flex flex-wrap gap-x-3 gap-y-2 text-xs text-gray-500">
          <a href="#" className="hover:underline">Terms</a>
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Cookie Policy</a>
          <a href="#" className="hover:underline">Accessibility</a>
          <span>© 2026 VerseLy.</span>
        </div>
      </div>
    </aside>
  )
}

export default RightSidebar
