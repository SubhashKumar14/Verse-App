import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import { createPost } from '../../services/postService'
import { composerCard, textareaClass, primaryBtn, iconBtn, formError } from '../../styles/common'
import { HiPhotograph, HiX } from 'react-icons/hi'
import toast from 'react-hot-toast'
import Avatar from '../common/Avatar'

const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth()
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const fileInputRef = useRef(null)
  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      content: '',
    },
  })

  const content = watch('content') || ''

  useEffect(() => {
    return () => {
      if (preview?.startsWith('blob:')) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  useEffect(() => {
    if (errors.content?.type === 'manual' && (content.trim() || image)) {
      clearErrors('content')
    }
  }, [content, image, errors.content, clearErrors])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      return toast.error('Please select an image file')
    }
    if (file.size > 5 * 1024 * 1024) {
      return toast.error('Image must be less than 5MB')
    }
    if (preview?.startsWith('blob:')) {
      URL.revokeObjectURL(preview)
    }
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    if (preview?.startsWith('blob:')) {
      URL.revokeObjectURL(preview)
    }
    setImage(null)
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (content.trim()) {
      clearErrors('content')
    }
  }

  const submitPost = async (values) => {
    const trimmedContent = values.content.trim()
    if (!trimmedContent && !image) {
      setError('content', {
        type: 'manual',
        message: 'Post content or image is required',
      })
      return
    }

    try {
      const formData = new FormData()
      formData.append('content', trimmedContent)
      if (image) formData.append('image', image)

      const { data } = await createPost(formData)
      reset({ content: '' })
      removeImage()
      toast.success('Post created!')
      onPostCreated?.(data.payload)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create post')
    }
  }

  return (
    <div className={composerCard}>
      <div className="flex gap-3.5">
        <Avatar
          src={user?.profilePicture}
          name={user?.username}
          sizeClassName="w-10 h-10 mt-1"
        />
        <form onSubmit={handleSubmit(submitPost)} className="flex-1 min-w-0">
          <textarea
            placeholder="What's on your mind..."
            rows={3}
            className={`${textareaClass} border-0 bg-transparent px-0 py-1.5 focus-visible:ring-0 resize-none text-[16px] leading-[1.7] placeholder:text-(--muted) placeholder:font-normal`}
            maxLength={500}
            {...register('content', {
              maxLength: {
                value: 500,
                message: 'Post content must be 500 characters or less',
              },
            })}
          />
          {errors.content && (
            <p className={`${formError} mt-2`}>{errors.content.message}</p>
          )}

          {/* Image Preview — borderless, rounded-xl */}
          {preview && (
            <div className="relative mt-3 w-fit">
              <img src={preview} alt="Upload preview" className="max-h-60 object-cover rounded-xl" />
              <button
                type="button"
                onClick={removeImage}
                aria-label="Remove attached image"
                className="absolute top-2 right-2 p-1.5 bg-(--text) hover:bg-(--danger) text-(--accent-ink) rounded-full transition-all duration-200"
              >
                <HiX className="text-sm" />
              </button>
            </div>
          )}

          <div className="flex justify-between items-center mt-3 pt-3 border-t border-(--border)">
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
                className={`${iconBtn} text-(--muted) hover:text-(--accent)`}
              >
                <HiPhotograph className="text-xl" />
              </button>
              {content.length > 0 && (
                <span className="text-xs text-(--muted) tabular-nums font-medium">
                  {500 - content.length}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={(!content.trim() && !image) || isSubmitting}
              className={primaryBtn}
            >
              {isSubmitting ? 'Posting…' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreatePost
