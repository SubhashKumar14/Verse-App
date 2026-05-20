import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { updateProfile } from '../services/userService'
import {
  pageTitleClass, pageSubtitle, sectionLabel, formGroup, labelClass, inputClass,
  textareaClass, primaryBtn, dangerBtn, formError, mutedText
} from '../styles/common'
import toast from 'react-hot-toast'

const Settings = () => {
  const { user, refreshUser } = useAuth()
  const { preference, setTheme } = useTheme()
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
      <p className={`${pageSubtitle} mb-10`}>Manage your account and preferences.</p>

      {/* Appearance Section */}
      <section className="mb-12">
        <h2 className={`${sectionLabel} mb-6 border-b border-[var(--border)] pb-2 text-[var(--text)]`}>
          Appearance
        </h2>
        <div className="space-y-3">
          <label className={labelClass}>Theme</label>
          <div className="flex gap-2">
            {['system', 'light', 'dark'].map(opt => (
              <button
                key={opt}
                onClick={() => setTheme(opt)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer capitalize ${
                  preference === opt
                    ? 'bg-[var(--accent)] text-[var(--accent-ink)]'
                    : 'bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)]'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          <p className={`${mutedText} mt-1`}>
            {preference === 'system' ? 'Following your system preference.' : `Using ${preference} mode.`}
          </p>
        </div>
      </section>

      {/* Public Profile Section */}
      <section className="mb-12">
        <h2 className={`${sectionLabel} mb-6 border-b border-[var(--border)] pb-2 text-[var(--text)]`}>
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
        <h2 className={`${sectionLabel} mb-6 border-b border-[var(--border)] pb-2 text-[var(--danger)]`}>
          Danger Zone
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-[var(--border)] bg-[var(--danger-soft)]">
          <div>
            <p className="font-semibold text-[var(--text)] text-sm">Delete Account</p>
            <p className="text-xs text-[var(--muted)] mt-1">Permanently remove your account and all data.</p>
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
