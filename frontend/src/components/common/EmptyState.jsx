import { emptyStateClass, emptyStateIcon, emptyStateText } from '../../styles/common'

const EmptyState = ({ icon, message }) => {
  return (
    <div className={emptyStateClass}>
      <div className={emptyStateIcon}>{icon}</div>
      <p className={emptyStateText}>{message}</p>
    </div>
  )
}

export default EmptyState
