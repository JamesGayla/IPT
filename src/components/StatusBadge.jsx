import { memo } from 'react'
import './Components.css'

const StatusBadge = memo(function StatusBadge({ status }) {
  return (
    <span className={`status-badge status-${status}`}>
      {status}
    </span>
  )
})

export default StatusBadge
