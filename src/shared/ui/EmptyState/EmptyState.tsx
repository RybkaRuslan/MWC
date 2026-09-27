import './EmptyState.scss'

interface EmptyStateProps {
  icon: string
  title: string
  text: string
}

export const EmptyState = ({ icon, title, text }: EmptyStateProps) => (
  <div className='ui-empty-state'>
    <img className='ui-empty-state__icon' src={icon} alt='' />
    <p className='ui-empty-state__title'>{title}</p>
    <p className='ui-empty-state__text'>{text}</p>
  </div>
)
