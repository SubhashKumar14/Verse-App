import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { toggleFollow } from '../../services/userService'
import { userCard, userAvatar, followBtn, followBtnFollow, followBtnUnfollow, mutedText } from '../../styles/common'
import toast from 'react-hot-toast'

const UserCard = ({ userData, showFollow = true }) => {
  const { user } = useAuth()
  const [following, setFollowing] = useState(
    userData.followers?.includes(user?._id) || false
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
    <Link to={`/profile/${userData._id}`} className={userCard}>
      <div className={userAvatar}>
        {userData.username?.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white truncate">{userData.username}</p>
        {userData.bio && <p className={`${mutedText} truncate`}>{userData.bio}</p>}
      </div>
      {showFollow && !isSelf && (
        <button
          onClick={handleFollow}
          disabled={loading}
          className={`${followBtn} ${following ? followBtnUnfollow : followBtnFollow}`}
        >
          {following ? 'Unfollow' : 'Follow'}
        </button>
      )}
    </Link>
  )
}

export default UserCard
