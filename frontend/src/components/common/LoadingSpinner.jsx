import { loadingClass } from '../../styles/common'

const LoadingSpinner = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  }
  return (
    <div className={loadingClass}>
      <div className={`${sizes[size]} border-purple-500 border-t-transparent rounded-full animate-spin`} />
    </div>
  )
}

export default LoadingSpinner
