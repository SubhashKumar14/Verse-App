import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { updateProfile } from '../services/userService'
import {
  pageTitleClass, formGroup, labelClass, inputClass,
  textareaClass, primaryBtn, formError, cardClass, mutedText
} from '../styles/common'
import toast from 'react-hot-toast'

const Settings = () => {
  const { user, refreshUser } = useAuth()
  const [form, setForm] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const errs = {}
    if (!form.username.trim()) errs.username = 'Username is required'
    else if (form.username.length < 3) errs.username = 'Min 3 characters'
    if (form.bio.length > 160) errs.bio = 'Max 160 characters'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      await updateProfile(user._id, form)
      await refreshUser()
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className={pageTitleClass}>Settings</h1>
      <p className={`${mutedText} mb-6`}>Update your profile information</p>

      <div className={cardClass}>
        <form onSubmit={handleSubmit}>
          <div className={formGroup}>
            <label className={labelClass}>Username</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className={inputClass}
              placeholder="Your username"
            />
            {errors.username && <p className={formError}>{errors.username}</p>}
          </div>
          <div className={formGroup}>
            <label className={labelClass}>Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className={textareaClass}
              placeholder="Tell people about yourself..."
              rows={4}
              maxLength={160}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.bio ? (
                <p className={formError}>{errors.bio}</p>
              ) : <span />}
              <span className={mutedText}>{form.bio.length}/160</span>
            </div>
          </div>
          <button type="submit" disabled={loading} className={primaryBtn}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Settings
