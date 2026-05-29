/**
 * frontend/src/components/common/EmptyState.jsx
 *
 * Simple empty-state presenter used across pages (feed, search, etc.).
 * Keeps empty UI consistent and driven by a short icon + message.
 */
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
