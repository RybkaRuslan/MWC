import './CalculationResults.scss'

export const CalculationResults = () => {
  return (
    <div className='calculation-results'>
      <div className='calculation-results__header'>
        <h2 className='calculation-results__title'>Результаты расчета</h2>
      </div>
      <div className='calculation-results__content'>
        <div className='calculation-results__placeholder'>
          <div className='calculation-results__icon'>📊</div>
          <p className='calculation-results__text'>Нет данных</p>
          <p className='calculation-results__subtext'>
            Введите данные, чтобы получить результаты расчета
          </p>
        </div>
      </div>
    </div>
  )
}
