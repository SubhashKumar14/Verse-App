/**
 * frontend/src/components/users/FollowModal.jsx
 *
 * Modal that lists a user's followers or following.
 * Fetches data on open and reuses <UserCard /> for each row.
 */
import { useEffect, useState } from 'react'
import { getFollowers, getFollowing } from '../../services/userService'
import UserCard from './UserCard'
import LoadingSpinner from '../common/LoadingSpinner'
import EmptyState from '../common/EmptyState'
import { overlay } from '../../styles/common'
import { HiX } from 'react-icons/hi'

const FollowModal = ({ userId, type, onClose }) => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      try {
        const { data } = type === 'followers' 
          ? await getFollowers(userId)
          : await getFollowing(userId)
        setUsers(data.payload || [])
      } catch (err) {
        console.error('Failed to fetch follow users:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [userId, type])

  return (
    <>
      <div className={overlay} onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--surface)] border border-[var(--border)] rounded-xl z-50 w-[90%] max-w-md max-h-[80vh] shadow-lg flex flex-col p-5">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-4">
          <h3 className="font-semibold text-lg text-[var(--text)] capitalize">{type}</h3>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors duration-200 cursor-pointer"
            aria-label="Close modal"
          >
            <HiX className="text-xl" />
          </button>
        </div>
        
        <div className="flex-grow overflow-y-auto min-h-0 space-y-1">
          {loading ? (
            <div className="py-8"><LoadingSpinner /></div>
          ) : users.length === 0 ? (
            <div className="py-8">
              <EmptyState 
                icon="✦" 
                message={type === 'followers' ? 'No followers yet.' : 'Not following anyone yet.'} 
              />
            </div>
          ) : (
            users.map((u) => (
              <UserCard key={u._id} userData={u} />
            ))
          )}
        </div>
      </div>
    </>
  )
}

export default FollowModal
