/**
 * frontend/src/components/common/Avatar.jsx
 *
 * Reusable avatar component.
 * Shows an image when available, otherwise falls back to the user's initial.
 * Automatically resets the error state when `src` changes.
 */
import { useEffect, useState } from 'react'

const Avatar = ({
  src,
  name,
  alt,
  sizeClassName = 'w-10 h-10',
  className = '',
}) => {
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setImageFailed(false)
  }, [src])

  const initial = name?.trim()?.charAt(0)?.toUpperCase() || '?'
  const showImage = Boolean(src) && !imageFailed

  return (
    <div
      className={`relative overflow-hidden rounded-full border border-(--border) bg-(--surface-2) ${sizeClassName} ${className}`}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt || `${name || 'Profile'} avatar`}
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-(--muted) font-semibold">
          {initial}
        </div>
      )}
    </div>
  )
}

export default Avatar
