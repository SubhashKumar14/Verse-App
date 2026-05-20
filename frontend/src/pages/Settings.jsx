import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { updateProfile } from '../services/userService'
import {
  pageTitleClass, formGroup, labelClass, inputClass,
  textareaClass, primaryBtn, dangerBtn, formError, mutedText
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
    <div className="max-w-xl">
      <h1 className={`${pageTitleClass} [text-wrap:balance]`}>Settings</h1>
      <p className={`${mutedText} mb-8`}>Manage your account preferences and profile details.</p>

      {/* Public Profile Section */}
      <section className="mb-12">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[color:var(--text)] mb-6 border-b border-[color:var(--border)] pb-2">
          Public Profile
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
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

          <div className="space-y-1.5">
            <label className={labelClass}>Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className={textareaClass}
              placeholder="Tell people about yourself..."
              rows={4}
              maxLength={160}
            />
            <div className="flex justify-between items-start mt-1">
              {errors.bio ? (
                <p className={formError}>{errors.bio}</p>
              ) : <span />}
              <span className={`${mutedText} tabular-nums text-xs font-medium`}>
                {form.bio.length}/160
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button type="submit" disabled={loading} className={primaryBtn}>
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </section>

      {/* Danger Zone Section */}
      <section className="mb-12">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[color:var(--danger)] mb-6 border-b border-[color:var(--border)] pb-2">
          Danger Zone
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-[color:color-mix(in_oklab,var(--danger)_30%,var(--border))] bg-[color:color-mix(in_oklab,var(--danger)_5%,transparent)]">
          <div>
            <p className="font-semibold text-[color:var(--text)] text-sm">Delete Account</p>
            <p className="text-xs text-[color:var(--muted)] mt-1">Permanently remove your account and all data.</p>
          </div>
          <button className={dangerBtn} type="button" onClick={() => toast.error('Not implemented yet')}>
            Delete Account
          </button>
        </div>
      </section>
    </div>
  )
}

export default Settings
