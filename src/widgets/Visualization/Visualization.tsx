import './Visualization.scss'

export const Visualization = () => {
  return (
    <div className='visualization'>
      <div className='visualization__header'>
        <h2 className='visualization__title'>Визуализация</h2>
      </div>
      <div className='visualization__content'>
        <div className='visualization__placeholder'>
          <div className='visualization__icon'>🎯</div>
          <p className='visualization__text'>Нет данных</p>
          <p className='visualization__subtext'>
            Введите данные, чтобы увидеть визуализацию
          </p>
        </div>
      </div>
    </div>
  )
}
