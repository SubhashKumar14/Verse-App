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
      <div className="flex gap-3">
        <div className={`${postAvatar} mt-0.5`}>
          {user?.username?.charAt(0).toUpperCase()}
        </div>
        <form onSubmit={handleSubmit} className="flex-1 min-w-0">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write something."
            rows={2}
            className={`${textareaClass} border-0 bg-transparent px-0 py-1 focus-visible:ring-0 resize-none text-[15px] placeholder:text-[color:var(--muted)] placeholder:font-normal`}
            maxLength={500}
          />

          {/* Image Preview */}
          {preview && (
            <div className="relative mt-2 w-fit">
              <img src={preview} alt="Upload preview" className="max-h-56 object-cover rounded-xl border border-[color:var(--border)]" />
              <button
                type="button"
                onClick={removeImage}
                aria-label="Remove attached image"
                className="absolute top-2 right-2 p-1.5 bg-[color:var(--text)] hover:bg-[color:var(--danger)] text-[color:var(--accent-ink)] rounded-full transition-colors duration-150"
              >
                <HiX className="text-sm" />
              </button>
            </div>
          )}

          <div className="flex justify-between items-center mt-2 pt-2 border-t border-[color:var(--border)]">
            <div className="flex items-center gap-2">
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
                className={`${iconBtn} text-[color:var(--muted)] hover:text-[color:var(--accent)]`}
              >
                <HiPhotograph className="text-lg" />
              </button>
              {content.length > 0 && (
                <span className="text-xs text-[color:var(--muted)] tabular-nums">
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
