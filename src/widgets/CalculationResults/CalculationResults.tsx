import './CalculationResults.scss'
import { useCalculation } from '@shared/context/CalculationContext'

export const CalculationResults = () => {
  const { calculationResult, isCalculating } = useCalculation()

  if (isCalculating) {
    return (
      <div className='calculation-results'>
        <div className='calculation-results__header'>
          <h2 className='calculation-results__title'>Результаты расчета</h2>
        </div>
        <div className='calculation-results__content'>
          <div className='calculation-results__loading'>
            <div className='calculation-results__spinner'></div>
            <p>Выполняется расчет...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!calculationResult) {
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
              Введите данные и нажмите "Рассчитать"
            </p>
          </div>
        </div>
      </div>
    )
  }

  const { capacityChecks, maxBoltForce, summary } = calculationResult

  // Найдем проверки по типам
  const shearCheck = capacityChecks.find(check => check.type === 'shear')
  const bearingProfileCheck = capacityChecks.find(
    check => check.type === 'bearing-profile',
  )
  const bearingPlateCheck = capacityChecks.find(
    check => check.type === 'bearing-plate',
  )

  return (
    <div className='calculation-results'>
      <div className='calculation-results__header'>
        <h2 className='calculation-results__title'>Результаты расчета</h2>
        <div
          className={`calculation-results__status ${summary.isAcceptable ? 'success' : 'error'}`}
        >
          {summary.isAcceptable
            ? '✓ Соединение прочное'
            : '⚠ Требуется коррекция'}
        </div>
      </div>

      <div className='calculation-results__content'>
        {/* Предельное усилие на смятие */}
        <div className='calculation-results__section'>
          <h3 className='calculation-results__section-title'>
            Предельное усилие на смятие
          </h3>
          <table className='calculation-results__table'>
            <thead>
              <tr>
                <th>Критерий</th>
                <th>[Nbp], тс</th>
                <th>Ки</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Для профиля</td>
                <td>{bearingProfileCheck?.capacity.toFixed(3) || '-'}</td>
                <td>{bearingProfileCheck?.utilization.toFixed(3) || '-'}</td>
              </tr>
              <tr>
                <td>Для фасонки</td>
                <td>{bearingPlateCheck?.capacity.toFixed(3) || '-'}</td>
                <td>{bearingPlateCheck?.utilization.toFixed(3) || '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Предельное усилие на срез */}
        <div className='calculation-results__section'>
          <h3 className='calculation-results__section-title'>
            Предельное усилие на срез
          </h3>
          <table className='calculation-results__table'>
            <thead>
              <tr>
                <th>Критерий</th>
                <th>[Nbs], тс</th>
                <th>Ки</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  Для болта М{calculationResult.input.bolt.diameter}.
                  {calculationResult.input.bolt.strengthClass.class}
                </td>
                <td>{shearCheck?.capacity.toFixed(3) || '-'}</td>
                <td>{shearCheck?.utilization.toFixed(3) || '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Расчетное сопротивление */}
        <div className='calculation-results__section'>
          <h3 className='calculation-results__section-title'>
            Расчетное сопротивление Rbp смятию элементов
          </h3>
          <table className='calculation-results__table'>
            <thead>
              <tr>
                <th>Материал</th>
                <th>Rbp, Н/мм²</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  для стали {calculationResult.input.profile.material.type}
                </td>
                <td>{calculationResult.input.profile.material.strength}</td>
              </tr>
              <tr>
                <td>для стали {calculationResult.input.plate.material.type}</td>
                <td>{calculationResult.input.plate.material.strength}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Расчетное сопротивление срезу */}
        <div className='calculation-results__section'>
          <h3 className='calculation-results__section-title'>
            Расчетное сопротивление Rbs срезу болтов
          </h3>
          <table className='calculation-results__table'>
            <thead>
              <tr>
                <th>Параметр</th>
                <th>Значение</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  для класса прочности{' '}
                  {calculationResult.input.bolt.strengthClass.class}, Н/мм²
                </td>
                <td>
                  {calculationResult.input.bolt.strengthClass.shearStrength}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Прочие параметры */}
        <div className='calculation-results__section'>
          <h3 className='calculation-results__section-title'>
            Прочие параметры
          </h3>
          <table className='calculation-results__table'>
            <thead>
              <tr>
                <th>Параметр</th>
                <th>Значение</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Площадь сечения болта Abn, см²</td>
                <td>1.57</td>
              </tr>
              <tr>
                <td>Коэффициент условия работы γс</td>
                <td>0.9</td>
              </tr>
              <tr>
                <td>Коэффициент условия работы γb</td>
                <td>0.9</td>
              </tr>
              <tr>
                <td>Число расчетных срезов одного болта</td>
                <td>2</td>
              </tr>
              <tr>
                <td>Количество фасонок</td>
                <td>1</td>
              </tr>
              <tr>
                <td>Количество соединяемых профилей</td>
                <td>2</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Максимальное усилие в болте */}
        <div className='calculation-results__summary'>
          <h3 className='calculation-results__summary-title'>
            Максимальное усилие в болте
          </h3>
          <p className='calculation-results__max-force'>
            Nmax = {maxBoltForce.value.toFixed(3)} тс
          </p>
          <p className='calculation-results__coordinates'>
            Координаты: X = {maxBoltForce.coordinates.x}мм, Y ={' '}
            {maxBoltForce.coordinates.y}мм
          </p>
        </div>

        {/* Рекомендации */}
        {summary.recommendations && (
          <div className='calculation-results__recommendations'>
            <h3 className='calculation-results__recommendations-title'>
              Рекомендации
            </h3>
            <ul className='calculation-results__recommendations-list'>
              {summary.recommendations.map((recommendation, index) => (
                <li key={index}>{recommendation}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
