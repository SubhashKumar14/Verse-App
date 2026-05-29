/**
 * frontend/src/components/users/UserCard.jsx
 *
 * Compact user preview card used in search results and recommendations.
 * Optionally includes a follow/unfollow button (hidden for self).
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { toggleFollow } from '../../services/userService'
import { userCard, followBtn, followBtnFollow, followBtnUnfollow, mutedText } from '../../styles/common'
import toast from 'react-hot-toast'
import Avatar from '../common/Avatar'

const UserCard = ({ userData, showFollow = true }) => {
  const { user } = useAuth()
  const [following, setFollowing] = useState(
    userData.isFollowing !== undefined
      ? userData.isFollowing
      : (userData.followers?.includes(user?._id) || false)
  )
  const [loading, setLoading] = useState(false)

  const isSelf = user?._id === userData._id

  const handleFollow = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setLoading(true)
    try {
      const { data } = await toggleFollow(userData._id)
      setFollowing(data.following)
    } catch {
      toast.error('Failed to toggle follow')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={userCard} aria-label={`View ${userData.username}'s profile`}>
      <Link to={`/profile/${userData._id}`} className="flex flex-1 items-center gap-3 min-w-0">
        <Avatar
          src={userData.profilePicture}
          name={userData.username}
          sizeClassName="w-10 h-10"
        />
        <div className="min-w-0">
          <p className="font-semibold text-[var(--text)] text-[14px] truncate">{userData.username}</p>
          {userData.bio && <p className={`${mutedText} truncate text-[13px] leading-snug mt-0.5`}>{userData.bio}</p>}
        </div>
      </Link>
      {showFollow && !isSelf && (
        <button
          onClick={handleFollow}
          disabled={loading}
          aria-pressed={following}
          className={`${followBtn} ${following ? followBtnUnfollow : followBtnFollow}`}
        >
          {following ? 'Unfollow' : 'Follow'}
        </button>
      )}
    </div>
  )
}

export default UserCard
