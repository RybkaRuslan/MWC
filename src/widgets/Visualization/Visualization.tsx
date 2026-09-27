import { noVisualIcon } from '@shared/assets/icons'
import { EmptyState } from '@shared/ui'

export const Visualization = () => {
  return (
    <div className='visualization panel'>
      <header className='panel__header'>
        <h2 className='panel__title'>Визуализация</h2>
      </header>
      <div className='panel__body'>
        <EmptyState
          icon={noVisualIcon}
          title='Нет данных'
          text='Введите данные, чтобы увидеть визуализацию'
        />
      </div>
    </div>
  )
}
