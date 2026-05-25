import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { updateProfile } from '../services/userService'
import Avatar from '../components/common/Avatar'
import {
  pageTitleClass, pageSubtitle, sectionLabel, labelClass, inputClass,
  textareaClass, primaryBtn, dangerBtn, formError, mutedText, secondaryBtn, ghostBtn
} from '../styles/common'
import toast from 'react-hot-toast'

const Settings = () => {
  const { user, refreshUser } = useAuth()
  const { preference, setTheme } = useTheme()
  const fileInputRef = useRef(null)
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(user?.profilePicture || '')
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      username: user?.username || '',
      bio: user?.bio || '',
    },
  })

  const bioValue = watch('bio') || ''

  useEffect(() => {
    reset({
      username: user?.username || '',
      bio: user?.bio || '',
    })
    setPhotoPreview(user?.profilePicture || '')
    setPhotoFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [user, reset])

  useEffect(() => {
    return () => {
      if (photoPreview && photoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreview)
      }
    }
  }, [photoPreview])

  const onSubmit = async (values) => {
    try {
      const payload = new FormData()
      payload.append('username', values.username.trim())
      payload.append('bio', values.bio.trim())
      if (photoFile) {
        payload.append('profilePicture', photoFile)
      }

      await updateProfile(user._id, payload)
      await refreshUser()
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    }
  }

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    if (photoPreview && photoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(photoPreview)
    }

    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const clearSelectedPhoto = () => {
    if (photoPreview && photoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(photoPreview)
    }

    setPhotoFile(null)
    setPhotoPreview(user?.profilePicture || '')

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="w-full">
      <h1 className={`${pageTitleClass} text-balance`}>Settings</h1>
      <p className={`${pageSubtitle} mb-10`}>Manage your account and preferences.</p>

      {/* Appearance Section */}
      <section className="mb-12">
        <h2 className={`${sectionLabel} mb-6 border-b border-(--border) pb-2 text-(--text)`}>
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
                    ? 'bg-(--accent) text-(--accent-ink)'
                    : 'bg-(--surface-2) text-(--muted) hover:text-(--text) border border-(--border)'
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
        <h2 className={`${sectionLabel} mb-6 border-b border-(--border) pb-2 text-(--text)`}>
          Public Profile
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex flex-col sm:flex-row gap-6 sm:items-start">
            <div className="flex flex-col items-start gap-3 shrink-0">
              <Avatar
                src={photoPreview}
                name={user?.username}
                sizeClassName="w-24 h-24"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handlePhotoChange}
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={secondaryBtn}
                >
                  {photoFile ? 'Change photo' : 'Add photo'}
                </button>
                {photoFile && (
                  <button
                    type="button"
                    onClick={clearSelectedPhoto}
                    className={ghostBtn}
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className={`${mutedText} text-xs leading-relaxed max-w-55`}>
                JPG, PNG, GIF, or WebP. Max 5MB.
              </p>
            </div>

            <div className="flex-1 space-y-6">
              <div className="space-y-1.5">
                <label className={labelClass}>Username</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Your username"
                  {...register('username', {
                    required: 'Username is required',
                    minLength: {
                      value: 3,
                      message: 'Min 3 characters',
                    },
                  })}
                />
                {errors.username && <p className={formError}>{errors.username.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>Bio</label>
                <textarea
                  className={textareaClass}
                  placeholder="Tell people about yourself..."
                  rows={4}
                  maxLength={160}
                  {...register('bio', {
                    maxLength: {
                      value: 160,
                      message: 'Max 160 characters',
                    },
                  })}
                />
                <div className="flex justify-between items-start mt-1">
                  {errors.bio ? (
                    <p className={formError}>{errors.bio.message}</p>
                  ) : <span />}
                  <span className={`${mutedText} tabular-nums text-xs font-medium`}>
                    {bioValue.length}/160
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" disabled={isSubmitting} className={primaryBtn}>
                  {isSubmitting ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </section>

      {/* Danger Zone Section */}
      <section className="mb-12">
        <h2 className={`${sectionLabel} mb-6 border-b border-(--border) pb-2 text-(--danger)`}>
          Danger Zone
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-(--border) bg-(--danger-soft)">
          <div>
            <p className="font-semibold text-(--text) text-sm">Delete Account</p>
            <p className="text-xs text-(--muted) mt-1">Permanently remove your account and all data.</p>
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
