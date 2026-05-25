import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { saveOnboardingInterests } from '../services/userService'
import {
  pageBackground, formCard, formTitle, submitBtn, mutedText,
  headingClass, pageSubtitle
} from '../styles/common'
import toast from 'react-hot-toast'
import logo from '../assets/versely_logo.png'

const categories = [
  { id: 'movies', label: '🎬 Movies' },
  { id: 'photography', label: '📷 Photography' },
  { id: 'art', label: '🎨 Art' },
  { id: 'food', label: '🍳 Food & Recipes' },
  { id: 'lifestyle', label: '✨ Lifestyle' },
  { id: 'travel', label: '✈️ Travel' },
  { id: 'football', label: '⚽ Football' },
  { id: 'cricket', label: '🏏 Cricket' },
  { id: 'fitness', label: '💪 Fitness' },
  { id: 'technology', label: '💻 Technology' },
  { id: 'gaming', label: '🎮 Gaming' },
  { id: 'books', label: '📚 Books' },
  { id: 'fashion', label: '🧥 Fashion' },
  { id: 'music', label: '🎵 Music' },
  { id: 'nature', label: '🌿 Nature' }
]

const Onboarding = () => {
  const { refreshUser } = useAuth()
  const navigate = useNavigate()
  const [selected, setSelected] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const toggleCategory = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(x => x !== id))
    } else {
      setSelected([...selected, id])
    }
  }

  const handleFinish = async () => {
    if (selected.length < 3) {
      toast.error('Please select at least 3 categories to personalize your feed')
      return
    }
    setSubmitting(true)
    try {
      await saveOnboardingInterests(selected)
      await refreshUser()
      toast.success('Preferences saved!')
      navigate('/home')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save interests')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={`${pageBackground} flex items-center justify-center py-12`}>
      <div className="w-full max-w-xl px-4">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="VerseLy" className="h-[60px] w-[60px] object-contain" />
          </div>
          <h1 className={`${headingClass} text-2xl font-bold tracking-tight text-[var(--text)]`}>
            Welcome to VerseLy
          </h1>
          <p className={`${mutedText} text-[15px] max-w-md mx-auto mt-2 leading-relaxed`}>
            Select at least 3 interest categories. We use these to build your personalized "For You" feed and recommend creators.
          </p>
        </div>

        {/* Selection Card */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 sm:p-8">
          <div className="flex justify-between items-baseline mb-6 border-b border-[var(--border)] pb-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
              Categories
            </h2>
            <span className="text-xs font-semibold text-[var(--accent)] bg-[var(--accent-soft)] px-2.5 py-1 rounded">
              Selected: {selected.length} / 3 min
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            {categories.map((cat) => {
              const isSelected = selected.includes(cat.id)
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  type="button"
                  className={`flex items-center justify-center p-3.5 rounded-lg border text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] font-semibold'
                      : 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  {cat.label}
                </button>
              )
            })}
          </div>

          <button
            onClick={handleFinish}
            disabled={selected.length < 3 || submitting}
            className={`${submitBtn} mt-0`}
          >
            {submitting ? 'Saving preferences...' : 'Explore VerseLy'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Onboarding
