import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getUser, toggleFollow } from '../services/userService'
import { getUserPosts } from '../services/postService'
import PostCard from '../components/posts/PostCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import {
  profileHeader, profileAvatar, profileName, profileBio,
  profileStat, profileStatNumber, profileStatLabel,
  followBtn, followBtnFollow, followBtnUnfollow, pageTitleClass
} from '../styles/common'
import toast from 'react-hot-toast'

const Profile = () => {
  const { id } = useParams()
  const { user: currentUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)

  const isSelf = currentUser?._id === id

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      try {
        const [userRes, postsRes] = await Promise.all([
          getUser(id),
          getUserPosts(id),
        ])
        setProfile(userRes.data.payload)
        setIsFollowing(userRes.data.isFollowing)
        setPosts(postsRes.data.payload)
      } catch {
        toast.error('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [id])

  const handleFollow = async () => {
    try {
      const { data } = await toggleFollow(id)
      setIsFollowing(data.following)
      setProfile((p) => ({
        ...p,
        followers: data.following
          ? [...(p.followers || []), currentUser._id]
          : (p.followers || []).filter((f) => f !== currentUser._id),
      }))
    } catch {
      toast.error('Failed to toggle follow')
    }
  }

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter((p) => p._id !== postId))
  }

  if (loading) return <LoadingSpinner />
  if (!profile) return <EmptyState icon="👤" message="User not found" />

  return (
    <div>
      {/* Profile Header */}
      <div className={profileHeader}>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className={profileAvatar}>
            {profile.username?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className={profileName}>{profile.username}</h1>
            {profile.bio && <p className={profileBio}>{profile.bio}</p>}
            <div className="flex gap-8 mt-4 justify-center sm:justify-start">
              <div className={profileStat}>
                <p className={profileStatNumber}>{profile.postsCount || 0}</p>
                <p className={profileStatLabel}>Posts</p>
              </div>
              <div className={profileStat}>
                <p className={profileStatNumber}>{profile.followers?.length || profile.followersCount || 0}</p>
                <p className={profileStatLabel}>Followers</p>
              </div>
              <div className={profileStat}>
                <p className={profileStatNumber}>{profile.following?.length || profile.followingCount || 0}</p>
                <p className={profileStatLabel}>Following</p>
              </div>
            </div>
          </div>
          {!isSelf && (
            <button
              onClick={handleFollow}
              className={`${followBtn} ${isFollowing ? followBtnUnfollow : followBtnFollow}`}
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          )}
        </div>
      </div>

      {/* User's Posts */}
      <h2 className={`${pageTitleClass} text-xl mt-6`}>Posts</h2>
      {posts.length === 0 ? (
        <EmptyState icon="📝" message="No posts yet" />
      ) : (
        <div className="space-y-4 mt-4">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} onDelete={handlePostDeleted} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Profile
