import { ChangeEvent, ReactNode, useState } from 'react'
import classNames from 'classnames'
import './Sidebar.scss'
import {
  calculateBoltConnection,
  parseRUSPANCSV,
  BOLT_CROSS_SECTION_AREAS,
  BOLT_STRENGTH_CLASSES,
  CalculationInput,
  STEEL_MATERIALS,
} from '@shared/lib/calculations'
import { formatNumber, parseNumber } from '@shared/lib/format'
import { useCalculation } from '@shared/context/CalculationContext'
import { logoIcon } from '@shared/assets/icons'
import { Button, Input, Select, SelectOption, Stepper } from '@shared/ui'

const MIN_ROWS = 1
const MAX_ROWS = 10
const DEFAULT_SPACING = '100'

const toOptions = (values: string[], suffix = ''): SelectOption[] =>
  values.map(value => ({ value, label: `${value}${suffix}` }))

const CALCULATION_TYPE_OPTIONS: SelectOption[] = [
  { value: 'column-base', label: 'База колонны' },
]
const PROFILE_THICKNESS_OPTIONS = toOptions([
  '1.5',
  '2',
  '2.5',
  '3',
  '3.5',
  '4',
])
const PLATE_THICKNESS_OPTIONS = toOptions([
  '6',
  '8',
  '10',
  '12',
  '14',
  '16',
  '20',
])
const STEEL_OPTIONS = toOptions(Object.keys(STEEL_MATERIALS))
const BOLT_DIAMETER_OPTIONS = Object.keys(BOLT_CROSS_SECTION_AREAS).map(d => ({
  value: d,
  label: `М${d}`,
}))
const STRENGTH_CLASS_OPTIONS = toOptions(Object.keys(BOLT_STRENGTH_CLASSES))

interface FormState {
  calculationType: string
  boltRows: { x: number; y: number }
  boltSpacing: { x: string[]; y: string[] }
  profile: { thickness: string; steel: string }
  plate: { thickness: string; steel: string }
  boltDiameter: string
  strengthClass: string
  forces: { N: string; M: string; Q: string }
  utilizationFactor: string
  plateHeight: string
}

type Axis = 'x' | 'y'

const INITIAL_FORM: FormState = {
  calculationType: 'column-base',
  boltRows: { x: 5, y: 3 },
  boltSpacing: { x: ['100', '160', '160', '90'], y: ['250', '150'] },
  profile: { thickness: '2.5', steel: 'С390' },
  plate: { thickness: '12', steel: 'С345' },
  boltDiameter: '16',
  strengthClass: '5.6',
  forces: { N: '39.6', M: '1.0', Q: '2.9' },
  utilizationFactor: '0.54',
  plateHeight: '350',
}

const resizeSpacing = (values: string[], rows: number) => {
  const count = Math.max(rows - 1, 0)
  if (values.length >= count) return values.slice(0, count)
  const fill = values[values.length - 1] ?? DEFAULT_SPACING
  return [...values, ...Array(count - values.length).fill(fill)]
}

const inputToForm = (input: CalculationInput): FormState => ({
  calculationType: 'column-base',
  boltRows: { ...input.boltRows },
  boltSpacing: {
    x: resizeSpacing(input.boltSpacing.x.map(String), input.boltRows.x),
    y: resizeSpacing(input.boltSpacing.y.map(String), input.boltRows.y),
  },
  profile: {
    thickness: String(input.profile.thickness),
    steel: input.profile.material.type,
  },
  plate: {
    thickness: String(input.plate.thickness),
    steel: input.plate.material.type,
  },
  boltDiameter: String(input.bolt.diameter),
  strengthClass: input.bolt.strengthClass.class,
  forces: {
    N: String(input.forces.N),
    M: String(input.forces.M),
    Q: String(input.forces.Q),
  },
  utilizationFactor: String(input.utilizationFactor),
  plateHeight: String(input.plateHeight),
})

const formToInput = (form: FormState): CalculationInput => ({
  boltRows: form.boltRows,
  boltSpacing: {
    x: form.boltSpacing.x.map(v => parseNumber(v, 0)),
    y: form.boltSpacing.y.map(v => parseNumber(v, 0)),
  },
  profile: {
    thickness: parseNumber(form.profile.thickness, 2.5),
    material: STEEL_MATERIALS[form.profile.steel] ?? STEEL_MATERIALS['С390'],
  },
  plate: {
    thickness: parseNumber(form.plate.thickness, 12),
    material: STEEL_MATERIALS[form.plate.steel] ?? STEEL_MATERIALS['С345'],
  },
  bolt: {
    diameter: parseNumber(form.boltDiameter, 16),
    strengthClass:
      BOLT_STRENGTH_CLASSES[form.strengthClass] ?? BOLT_STRENGTH_CLASSES['5.6'],
  },
  forces: {
    N: parseNumber(form.forces.N, 0),
    M: parseNumber(form.forces.M, 0),
    Q: parseNumber(form.forces.Q, 0),
  },
  connectionType: '2S',
  plateHeight: parseNumber(form.plateHeight, 350),
  plateWidth: 250,
  utilizationFactor: parseNumber(form.utilizationFactor, 0.54),
})

const Section = ({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) => (
  <section className='sidebar__section'>
    <h3 className='sidebar__section-title'>{title}</h3>
    <div className='sidebar__card'>{children}</div>
  </section>
)

const Row = ({
  label,
  muted,
  children,
}: {
  label: ReactNode
  muted?: boolean
  children: ReactNode
}) => (
  <label className='sidebar__row'>
    <span
      className={classNames('sidebar__label', {
        'sidebar__label--muted': muted,
      })}
    >
      {label}
    </span>
    <span className='sidebar__control'>{children}</span>
  </label>
)

export const Sidebar = () => {
  const {
    calculationResult,
    setCalculationResult,
    isCalculating,
    setIsCalculating,
  } = useCalculation()

  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [isSpacingOpen, setIsSpacingOpen] = useState(true)
  const [importMessage, setImportMessage] = useState<{
    text: string
    isError: boolean
  } | null>(null)

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const updateNested = <K extends 'profile' | 'plate' | 'forces'>(
    key: K,
    field: keyof FormState[K],
    value: string,
  ) => setForm(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }))

  const changeRows = (axis: Axis, rows: number) =>
    setForm(prev => ({
      ...prev,
      boltRows: { ...prev.boltRows, [axis]: rows },
      boltSpacing: {
        ...prev.boltSpacing,
        [axis]: resizeSpacing(prev.boltSpacing[axis], rows),
      },
    }))

  const changeSpacing = (axis: Axis, index: number, value: string) =>
    setForm(prev => ({
      ...prev,
      boltSpacing: {
        ...prev.boltSpacing,
        [axis]: prev.boltSpacing[axis].map((v, i) => (i === index ? value : v)),
      },
    }))

  const runCalculation = (input: CalculationInput) => {
    setIsCalculating(true)
    try {
      setCalculationResult(calculateBoltConnection(input))
    } catch (error) {
      console.error('Ошибка расчета:', error)
    } finally {
      setIsCalculating(false)
    }
  }

  const handleReset = () => {
    setForm(INITIAL_FORM)
    setImportMessage(null)
    setCalculationResult(null)
  }

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setImportMessage({
        text: 'Поддерживаются только CSV-файлы',
        isError: true,
      })
      return
    }

    const reader = new FileReader()
    reader.onload = e => {
      const parsed = parseRUSPANCSV(e.target?.result as string)
      if (parsed.errors.length > 0) {
        console.error('Ошибки при парсинге CSV:', parsed.errors)
        setImportMessage({ text: 'Не удалось прочитать файл', isError: true })
        return
      }
      setForm(inputToForm(parsed.input))
      setImportMessage({ text: `Загружено: ${file.name}`, isError: false })
      runCalculation(parsed.input)
    }
    reader.readAsText(file)
  }

  const spacingRows = Math.max(
    form.boltSpacing.x.length,
    form.boltSpacing.y.length,
  )

  const renderSpacingCell = (axis: Axis, index: number) => {
    const value = form.boltSpacing[axis][index]
    if (value === undefined) return <span className='sidebar__spacing-cell' />
    const name = `${axis.toUpperCase()}${index + 1}`
    return (
      <label className='sidebar__spacing-cell'>
        <span className='sidebar__spacing-label'>{name}</span>
        <Input
          inputMode='decimal'
          value={value}
          onChange={e => changeSpacing(axis, index, e.target.value)}
          aria-label={`Расстояние ${name}, мм`}
        />
      </label>
    )
  }

  return (
    <div className='sidebar panel'>
      <header className='panel__header sidebar__header'>
        <img src={logoIcon} alt='RUSPAN' className='sidebar__logo' />
        <span className='panel__title'>Калькулятор</span>
      </header>

      <div className='sidebar__content scrollable'>
        <section className='sidebar__section'>
          <h3 className='sidebar__section-title'>Вид расчета</h3>
          <Select
            options={CALCULATION_TYPE_OPTIONS}
            value={form.calculationType}
            onChange={e => update('calculationType', e.target.value)}
          />
        </section>

        <Section title='Расположение болтов'>
          <div className='sidebar__row'>
            <span className='sidebar__label sidebar__label--wide'>
              Количество рядов по оси X
            </span>
            <Stepper
              label='Количество рядов по оси X'
              value={form.boltRows.x}
              min={MIN_ROWS}
              max={MAX_ROWS}
              onChange={rows => changeRows('x', rows)}
            />
          </div>
          <div className='sidebar__row'>
            <span className='sidebar__label sidebar__label--wide'>
              Количество рядов по оси Y
            </span>
            <Stepper
              label='Количество рядов по оси Y'
              value={form.boltRows.y}
              min={MIN_ROWS}
              max={MAX_ROWS}
              onChange={rows => changeRows('y', rows)}
            />
          </div>

          {spacingRows > 0 && (
            <div className='sidebar__group'>
              <button
                type='button'
                className={classNames('sidebar__collapse', {
                  'sidebar__collapse--open': isSpacingOpen,
                })}
                onClick={() => setIsSpacingOpen(open => !open)}
                aria-expanded={isSpacingOpen}
              >
                Расстояние между болтами, мм
                <svg width='12' height='12' viewBox='0 0 12 12' aria-hidden>
                  <path d='M2 4.5l4 4 4-4' />
                </svg>
              </button>
              {isSpacingOpen && (
                <div className='sidebar__spacing'>
                  {Array.from({ length: spacingRows }, (_, index) => (
                    <div className='sidebar__spacing-row' key={index}>
                      {renderSpacingCell('x', index)}
                      {renderSpacingCell('y', index)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Section>

        <Section title='Параметры элементов узла'>
          <div className='sidebar__group'>
            <span className='sidebar__group-title'>Профиль</span>
            <Row label='t, мм' muted>
              <Select
                options={PROFILE_THICKNESS_OPTIONS}
                value={form.profile.thickness}
                onChange={e =>
                  updateNested('profile', 'thickness', e.target.value)
                }
              />
            </Row>
            <Row label='Сталь' muted>
              <Select
                options={STEEL_OPTIONS}
                value={form.profile.steel}
                onChange={e => updateNested('profile', 'steel', e.target.value)}
              />
            </Row>
          </div>
          <div className='sidebar__group'>
            <span className='sidebar__group-title'>Фасонка</span>
            <Row label='t, мм' muted>
              <Select
                options={PLATE_THICKNESS_OPTIONS}
                value={form.plate.thickness}
                onChange={e =>
                  updateNested('plate', 'thickness', e.target.value)
                }
              />
            </Row>
            <Row label='Сталь' muted>
              <Select
                options={STEEL_OPTIONS}
                value={form.plate.steel}
                onChange={e => updateNested('plate', 'steel', e.target.value)}
              />
            </Row>
          </div>
          <Row label='Болты, d'>
            <Select
              options={BOLT_DIAMETER_OPTIONS}
              value={form.boltDiameter}
              onChange={e => update('boltDiameter', e.target.value)}
            />
          </Row>
          <Row label='Класс прочности'>
            <Select
              options={STRENGTH_CLASS_OPTIONS}
              value={form.strengthClass}
              onChange={e => update('strengthClass', e.target.value)}
            />
          </Row>
        </Section>

        <Section title='Усилия в узле'>
          <Row label='N, тс'>
            <Input
              inputMode='decimal'
              placeholder='Введите'
              value={form.forces.N}
              onChange={e => updateNested('forces', 'N', e.target.value)}
            />
          </Row>
          <Row label='M, тс·м'>
            <Input
              inputMode='decimal'
              placeholder='Введите'
              value={form.forces.M}
              onChange={e => updateNested('forces', 'M', e.target.value)}
            />
          </Row>
          <Row label='Q, тс'>
            <Input
              inputMode='decimal'
              placeholder='Введите'
              value={form.forces.Q}
              onChange={e => updateNested('forces', 'Q', e.target.value)}
            />
          </Row>
          <Row label='ku'>
            <Input
              inputMode='decimal'
              placeholder='Введите'
              value={form.utilizationFactor}
              onChange={e => update('utilizationFactor', e.target.value)}
            />
          </Row>
          <p className='sidebar__formula'>
            N<sub>b</sub>
            <sup>max</sup> ={' '}
            {calculationResult
              ? `${formatNumber(calculationResult.maxBoltForce.value, 2)} тс`
              : '—'}
          </p>
        </Section>

        <Section title='Параметры фасонного элемента'>
          <Row label='h, мм'>
            <Input
              inputMode='decimal'
              placeholder='Введите'
              value={form.plateHeight}
              onChange={e => update('plateHeight', e.target.value)}
            />
          </Row>
        </Section>

        <Section title='Импорт данных'>
          <div className='sidebar__import'>
            <label className='sidebar__upload'>
              <input
                type='file'
                accept='.csv'
                onChange={handleFileUpload}
                className='sidebar__upload-input'
              />
              <svg width='20' height='20' viewBox='0 0 20 20' aria-hidden>
                <path d='M10 13V4M6 8l4-4 4 4M4 13v2a1 1 0 001 1h10a1 1 0 001-1v-2' />
              </svg>
              Загрузить CSV
            </label>
            {importMessage && (
              <span
                className={classNames('sidebar__import-message', {
                  'sidebar__import-message--error': importMessage.isError,
                })}
              >
                {importMessage.text}
              </span>
            )}
          </div>
        </Section>
      </div>

      <footer className='sidebar__footer'>
        {calculationResult ? (
          <>
            <Button
              variant='secondary'
              onClick={handleReset}
              disabled={isCalculating}
            >
              Сбросить
            </Button>
            <Button
              onClick={() => runCalculation(formToInput(form))}
              disabled={isCalculating}
            >
              {isCalculating ? 'Расчет...' : 'Пересчитать'}
            </Button>
          </>
        ) : (
          <Button
            onClick={() => runCalculation(formToInput(form))}
            disabled={isCalculating}
          >
            {isCalculating ? 'Расчет...' : 'Рассчитать'}
          </Button>
        )}
      </footer>
    </div>
  )
}
