import classNames from 'classnames'
import './CalculationResults.scss'
import { useCalculation } from '@shared/context/CalculationContext'
import {
  BEARING_STRENGTH,
  BOLT_CROSS_SECTION_AREAS,
  CapacityCheck,
  CONNECTION_TYPES,
  SAFETY_FACTORS,
} from '@shared/lib/calculations'
import { formatNumber } from '@shared/lib/format'
import { noDataIcon } from '@shared/assets/icons'
import { EmptyState } from '@shared/ui'

interface CheckRow {
  label: string
  check?: CapacityCheck
}

interface ParamRow {
  label: string
  value: string | number
}

const CheckTable = ({ title, rows }: { title: string; rows: CheckRow[] }) => (
  <div className='calculation-results__block'>
    <h3 className='calculation-results__block-title'>{title}</h3>
    <table className='calculation-results__table'>
      <thead>
        <tr>
          <th>Критерии</th>
          <th>тс</th>
          <th>Ku</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ label, check }) => (
          <tr key={label}>
            <td>{label}</td>
            <td>{check ? formatNumber(check.capacity) : '—'}</td>
            <td
              className={classNames({
                'calculation-results__cell--success': check?.isAcceptable,
                'calculation-results__cell--error':
                  check && !check.isAcceptable,
              })}
            >
              {check ? formatNumber(check.utilization) : '—'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

const ParamList = ({ title, rows }: { title: string; rows: ParamRow[] }) => (
  <div className='calculation-results__block'>
    <h3 className='calculation-results__block-title'>{title}</h3>
    <dl className='calculation-results__params'>
      {rows.map(({ label, value }) => (
        <div className='calculation-results__param' key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  </div>
)

export const CalculationResults = () => {
  const { calculationResult, isCalculating } = useCalculation()

  const renderBody = () => {
    if (isCalculating) {
      return (
        <div className='calculation-results__loading'>
          <div className='calculation-results__spinner' />
          <p>Выполняется расчет...</p>
        </div>
      )
    }

    if (!calculationResult) {
      return (
        <EmptyState
          icon={noDataIcon}
          title='Нет данных'
          text='Введите данные, чтобы получить результаты расчета'
        />
      )
    }

    const { input, capacityChecks, summary } = calculationResult
    const findCheck = (type: CapacityCheck['type']) =>
      capacityChecks.find(check => check.type === type)
    const { bolt, profile, plate } = input
    const connection = CONNECTION_TYPES[input.connectionType]
    const boltName = `М${bolt.diameter}, класс ${bolt.strengthClass.class}`

    return (
      <div className='calculation-results__content scrollable'>
        <CheckTable
          title='Предельное усилие на смятие'
          rows={[
            {
              label: 'Для профиля, [Nbp]',
              check: findCheck('bearing-profile'),
            },
            { label: 'Для фасонки, [Nbp]', check: findCheck('bearing-plate') },
          ]}
        />
        <CheckTable
          title='Предельное усилие на срез'
          rows={[
            {
              label: `Для болта ${boltName}, [Nbs]`,
              check: findCheck('shear'),
            },
          ]}
        />
        <ParamList
          title='Расчетное сопротивление Rbp смятию элементов'
          rows={[
            {
              label: `Для стали ${profile.material.type}, Н/мм²`,
              value: BEARING_STRENGTH[profile.material.type] ?? '—',
            },
            {
              label: `Для стали ${plate.material.type}, Н/мм²`,
              value: BEARING_STRENGTH[plate.material.type] ?? '—',
            },
          ]}
        />
        <ParamList
          title='Расчетное сопротивление Rbs срезу болтов'
          rows={[
            {
              label: `Для класса прочности ${bolt.strengthClass.class}, Н/мм²`,
              value: bolt.strengthClass.shearStrength,
            },
          ]}
        />
        <ParamList
          title='Прочие параметры'
          rows={[
            {
              label: 'Площадь сечения болта Abn, см²',
              value: formatNumber(
                BOLT_CROSS_SECTION_AREAS[bolt.diameter] ?? 0,
                2,
              ),
            },
            {
              label: 'Коэффициент условия работы γc',
              value: formatNumber(SAFETY_FACTORS.gammaC, 1),
            },
            {
              label: 'Коэффициент условия работы γb',
              value: formatNumber(SAFETY_FACTORS.gammaB, 1),
            },
            {
              label: 'Число расчетных срезов одного болта',
              value: connection.shearPlanes,
            },
            { label: 'Количество фасонок', value: connection.plates },
            {
              label: 'Количество соединяемых профилей',
              value: connection.profiles,
            },
          ]}
        />
        {!summary.isAcceptable && summary.recommendations?.length ? (
          <div className='calculation-results__notice'>
            <h3 className='calculation-results__block-title'>Рекомендации</h3>
            <ul>
              {summary.recommendations.map(recommendation => (
                <li key={recommendation}>{recommendation}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div className='calculation-results panel'>
      <header className='panel__header'>
        <h2 className='panel__title'>Результаты расчета</h2>
      </header>
      <div className='panel__body'>{renderBody()}</div>
    </div>
  )
}
