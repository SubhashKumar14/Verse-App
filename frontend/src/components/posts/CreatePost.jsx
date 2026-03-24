import { useState, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { createPost } from '../../services/postService'
import { postCard, postAvatar, textareaClass, primaryBtn, iconBtn } from '../../styles/common'
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
    <div className={postCard}>
      <div className="flex gap-3">
        <div className={postAvatar}>
          {user?.username?.charAt(0).toUpperCase()}
        </div>
        <form onSubmit={handleSubmit} className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={3}
            className={textareaClass}
            maxLength={500}
          />
          
          {/* Image Preview */}
          {preview && (
            <div className="relative mt-3 w-fit">
              <img src={preview} alt="Upload preview" className="max-h-64 object-cover rounded-xl border border-gray-200 dark:border-gray-800" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1.5 bg-gray-900/70 hover:bg-red-500 text-white rounded-full backdrop-blur-sm transition-colors"
                title="Remove image"
              >
                <HiX className="text-sm" />
              </button>
            </div>
          )}

          <div className="flex justify-between items-center mt-3 border-t border-gray-100 dark:border-gray-800/80 pt-3">
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
                className={`${iconBtn} text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20`}
                title="Attach photo"
              >
                <HiPhotograph className="text-xl" />
              </button>
              <span className="text-xs text-gray-400 font-medium ml-2">{content.length}/500</span>
            </div>
            
            <button
              type="submit"
              disabled={(!content.trim() && !image) || loading}
              className={primaryBtn}
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreatePost
