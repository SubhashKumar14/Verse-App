import { useState, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { createPost } from '../../services/postService'
import { composerCard, postAvatar, textareaClass, primaryBtn, iconBtn } from '../../styles/common'
import { HiPhotograph, HiX } from 'react-icons/hi'
import toast from 'react-hot-toast'

const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      return toast.error('Please select an image file')
    }
    if (file.size > 5 * 1024 * 1024) {
      return toast.error('Image must be less than 5MB')
    }
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setImage(null)
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim() && !image) return toast.error('Post content or image is required')

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('content', content.trim())
      if (image) formData.append('image', image)

      const { data } = await createPost(formData)
      setContent('')
      removeImage()
      toast.success('Post created!')
      onPostCreated?.(data.payload)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={composerCard}>
      <div className="flex gap-3.5">
        <div className={`${postAvatar} mt-1`}>
          {user?.username?.charAt(0).toUpperCase()}
        </div>
        <form onSubmit={handleSubmit} className="flex-1 min-w-0">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind..."
            rows={3}
            className={`${textareaClass} border-0 bg-transparent px-0 py-1.5 focus-visible:ring-0 resize-none text-[16px] leading-[1.7] placeholder:text-[var(--muted)] placeholder:font-normal`}
            maxLength={500}
          />

          {/* Image Preview — borderless, rounded-xl */}
          {preview && (
            <div className="relative mt-3 w-fit">
              <img src={preview} alt="Upload preview" className="max-h-60 object-cover rounded-xl" />
              <button
                type="button"
                onClick={removeImage}
                aria-label="Remove attached image"
                className="absolute top-2 right-2 p-1.5 bg-[var(--text)] hover:bg-[var(--danger)] text-[var(--accent-ink)] rounded-full transition-all duration-200"
              >
                <HiX className="text-sm" />
              </button>
            </div>
          )}

          <div className="flex justify-between items-center mt-3 pt-3 border-t border-[var(--border)]">
            <div className="flex items-center gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                accept="image/jpeg,image/png,image/gif,image/webp"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Attach a photo"
                className={`${iconBtn} text-[var(--muted)] hover:text-[var(--accent)]`}
              >
                <HiPhotograph className="text-xl" />
              </button>
              {content.length > 0 && (
                <span className="text-xs text-[var(--muted)] tabular-nums font-medium">
                  {500 - content.length}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={(!content.trim() && !image) || loading}
              className={primaryBtn}
            >
              {loading ? 'Posting…' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreatePost
