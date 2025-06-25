import React, { useState } from 'react'
import './Sidebar.scss'
import {
  calculateBoltConnection,
  parseRUSPANCSV,
  STEEL_MATERIALS,
  BOLT_STRENGTH_CLASSES,
} from '@shared/lib/calculations'
import { useCalculation } from '@shared/context/CalculationContext'

export const Sidebar = () => {
  const {
    calculationResult,
    setCalculationResult,
    isCalculating,
    setIsCalculating,
  } = useCalculation()

  const initialFormData = {
    // Базовые элементы
    baseType: '',
    baseConfiguration: '',

    // Расположение болтов
    boltCount: { x: '5', y: '3' },

    // Параметры элементов узла
    profile: { name: '2.5', steel: 'С390' },
    fascia: { name: '12', steel: 'С345' },
    boltDiameter: '16',
    proxyCert: '5.6',

    // Условия в узле
    longitudinalForce: '39.6',
    moment: '1.0',
    transverseForce: '2.9',
    forceCoefficient: '0.54',

    // Параметры фасонного элемента
    height: '350',
  }

  const [formData, setFormData] = useState(initialFormData)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleNestedInputChange = (
    parent: string,
    field: string,
    value: string,
  ) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof typeof prev] as object),
        [field]: value,
      },
    }))
  }

  const handleCalculate = async () => {
    setIsCalculating(true)

    try {
      // Подготовка входных данных для расчета
      const calculationInput = {
        boltRows: {
          x: parseInt(formData.boltCount.x) || 5,
          y: parseInt(formData.boltCount.y) || 3,
        },
        boltSpacing: {
          x: [100, 160, 160, 90], // По умолчанию, можно будет сделать настраиваемым
          y: [250, 150],
        },
        profile: {
          thickness: parseFloat(formData.profile.name) || 2.5,
          material:
            STEEL_MATERIALS[formData.profile.steel] || STEEL_MATERIALS['С390'],
        },
        plate: {
          thickness: parseFloat(formData.fascia.name) || 12,
          material:
            STEEL_MATERIALS[formData.fascia.steel] || STEEL_MATERIALS['С345'],
        },
        bolt: {
          diameter: parseInt(formData.boltDiameter) || 16,
          strengthClass:
            BOLT_STRENGTH_CLASSES[formData.proxyCert] ||
            BOLT_STRENGTH_CLASSES['5.6'],
        },
        forces: {
          N: parseFloat(formData.longitudinalForce) || 0,
          M: parseFloat(formData.moment) || 0,
          Q: parseFloat(formData.transverseForce) || 0,
        },
        connectionType: '2S' as const,
        plateHeight: parseFloat(formData.height) || 350,
        plateWidth: 250, // По умолчанию
        utilizationFactor: parseFloat(formData.forceCoefficient) || 0.54,
      }

      // Выполнение расчета
      const result = calculateBoltConnection(calculationInput)
      setCalculationResult(result)
    } catch (error) {
      console.error('Ошибка расчета:', error)
    } finally {
      setIsCalculating(false)
    }
  }

  const handleReset = () => {
    // Очищаем форму
    setFormData(initialFormData)
    // Очищаем результаты расчета
    setCalculationResult(null)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.name.endsWith('.csv')) {
      const reader = new FileReader()
      reader.onload = e => {
        const csvContent = e.target?.result as string
        const parsed = parseRUSPANCSV(csvContent)

        if (parsed.errors.length === 0) {
          // Заполняем форму данными из CSV
          const input = parsed.input
          setFormData({
            baseType: '',
            baseConfiguration: '',
            boltCount: {
              x: input.boltRows.x.toString(),
              y: input.boltRows.y.toString(),
            },
            profile: {
              name: input.profile.thickness.toString(),
              steel: input.profile.material.type,
            },
            fascia: {
              name: input.plate.thickness.toString(),
              steel: input.plate.material.type,
            },
            boltDiameter: input.bolt.diameter.toString(),
            proxyCert: input.bolt.strengthClass.class,
            longitudinalForce: input.forces.N.toString(),
            moment: input.forces.M.toString(),
            transverseForce: input.forces.Q.toString(),
            forceCoefficient: input.utilizationFactor.toString(),
            height: input.plateHeight.toString(),
          })

          // Автоматически выполняем расчет
          setTimeout(() => {
            const result = calculateBoltConnection(input)
            setCalculationResult(result)
          }, 100)
        } else {
          console.error('Ошибки при парсинге CSV:', parsed.errors)
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className='sidebar'>
      <div className='sidebar__header'>
        <h2 className='sidebar__title'>Калькулятор</h2>
      </div>

      <div className='sidebar__content'>
        {/* Блок 1: Вид расчета */}
        <div className='sidebar__section'>
          <h3 className='sidebar__section-title'>Вид расчета</h3>
          <div className='sidebar__field'>
            <label className='sidebar__label'>База основы</label>
            <select
              className='sidebar__select'
              value={formData.baseType}
              onChange={e => handleInputChange('baseType', e.target.value)}
            >
              <option value=''>Выберите...</option>
              <option value='type1'>Тип 1</option>
              <option value='type2'>Тип 2</option>
            </select>
          </div>
          <div className='sidebar__field'>
            <label className='sidebar__label'>Расположение болтов</label>
            <select
              className='sidebar__select'
              value={formData.baseConfiguration}
              onChange={e =>
                handleInputChange('baseConfiguration', e.target.value)
              }
            >
              <option value=''>Выберите...</option>
              <option value='config1'>Конфигурация 1</option>
              <option value='config2'>Конфигурация 2</option>
            </select>
          </div>
        </div>

        {/* Блок 2: Количество рядов по оси X и Y */}
        <div className='sidebar__section'>
          <h3 className='sidebar__section-title'>Параметры элементов узла</h3>
          <div className='sidebar__field'>
            <label className='sidebar__label'>Количество рядов по оси X</label>
            <input
              type='number'
              className='sidebar__input'
              value={formData.boltCount.x}
              onChange={e =>
                handleNestedInputChange('boltCount', 'x', e.target.value)
              }
              placeholder='Введите количество'
            />
          </div>
          <div className='sidebar__field'>
            <label className='sidebar__label'>Количество рядов по оси Y</label>
            <input
              type='number'
              className='sidebar__input'
              value={formData.boltCount.y}
              onChange={e =>
                handleNestedInputChange('boltCount', 'y', e.target.value)
              }
              placeholder='Введите количество'
            />
          </div>
        </div>

        {/* Блок 3: Параметры элементов узла */}
        <div className='sidebar__section'>
          <h3 className='sidebar__section-title'>Параметры элементов узла</h3>
          <div className='sidebar__field'>
            <label className='sidebar__label'>Профиль, t мм</label>
            <input
              type='text'
              className='sidebar__input'
              value={formData.profile.name}
              onChange={e =>
                handleNestedInputChange('profile', 'name', e.target.value)
              }
              placeholder='Толщина профиля'
            />
            <select
              className='sidebar__select'
              value={formData.profile.steel}
              onChange={e =>
                handleNestedInputChange('profile', 'steel', e.target.value)
              }
            >
              <option value=''>Выберите сталь</option>
              <option value='С245'>С245</option>
              <option value='С345'>С345</option>
              <option value='С375'>С375</option>
              <option value='С390'>С390</option>
            </select>
          </div>
          <div className='sidebar__field'>
            <label className='sidebar__label'>Фасонка, t мм</label>
            <input
              type='text'
              className='sidebar__input'
              value={formData.fascia.name}
              onChange={e =>
                handleNestedInputChange('fascia', 'name', e.target.value)
              }
              placeholder='Толщина фасонки'
            />
            <select
              className='sidebar__select'
              value={formData.fascia.steel}
              onChange={e =>
                handleNestedInputChange('fascia', 'steel', e.target.value)
              }
            >
              <option value=''>Выберите сталь</option>
              <option value='С245'>С245</option>
              <option value='С345'>С345</option>
              <option value='С375'>С375</option>
              <option value='С390'>С390</option>
            </select>
          </div>
          <div className='sidebar__field'>
            <label className='sidebar__label'>Болт, d</label>
            <input
              type='number'
              className='sidebar__input'
              value={formData.boltDiameter}
              onChange={e => handleInputChange('boltDiameter', e.target.value)}
              placeholder='Диаметр болта'
            />
          </div>
          <div className='sidebar__field'>
            <label className='sidebar__label'>Класс прочности</label>
            <select
              className='sidebar__select'
              value={formData.proxyCert}
              onChange={e => handleInputChange('proxyCert', e.target.value)}
            >
              <option value=''>Выберите класс</option>
              <option value='5.6'>5.6</option>
              <option value='5.8'>5.8</option>
              <option value='8.8'>8.8</option>
              <option value='10.9'>10.9</option>
            </select>
          </div>
        </div>

        {/* Блок 4: Условия в узле */}
        <div className='sidebar__section'>
          <h3 className='sidebar__section-title'>Условия в узле</h3>
          <div className='sidebar__field'>
            <label className='sidebar__label'>N, тс</label>
            <input
              type='number'
              className='sidebar__input'
              value={formData.longitudinalForce}
              onChange={e =>
                handleInputChange('longitudinalForce', e.target.value)
              }
              placeholder='Продольная сила'
            />
          </div>
          <div className='sidebar__field'>
            <label className='sidebar__label'>M, тс*м</label>
            <input
              type='number'
              className='sidebar__input'
              value={formData.moment}
              onChange={e => handleInputChange('moment', e.target.value)}
              placeholder='Момент'
            />
          </div>
          <div className='sidebar__field'>
            <label className='sidebar__label'>Q, тс</label>
            <input
              type='number'
              className='sidebar__input'
              value={formData.transverseForce}
              onChange={e =>
                handleInputChange('transverseForce', e.target.value)
              }
              placeholder='Поперечная сила'
            />
          </div>
          <div className='sidebar__field'>
            <label className='sidebar__label'>ku</label>
            <input
              type='number'
              className='sidebar__input'
              value={formData.forceCoefficient}
              onChange={e =>
                handleInputChange('forceCoefficient', e.target.value)
              }
              placeholder='Коэффициент использования'
            />
          </div>
        </div>

        {/* Блок 5: Параметры фасонного элемента */}
        <div className='sidebar__section'>
          <h3 className='sidebar__section-title'>
            Параметры фасонного элемента
          </h3>
          <div className='sidebar__field'>
            <label className='sidebar__label'>h, мм</label>
            <input
              type='number'
              className='sidebar__input'
              value={formData.height}
              onChange={e => handleInputChange('height', e.target.value)}
              placeholder='Высота'
            />
          </div>
          <div className='sidebar__field'>
            <label className='sidebar__label'>hт, мм</label>
            <input
              type='number'
              className='sidebar__input'
              placeholder='Толщина'
              defaultValue='250'
            />
          </div>
          <div className='sidebar__field'>
            <label className='sidebar__label'>кт</label>
            <input
              type='number'
              className='sidebar__input'
              placeholder='Коэффициент'
              defaultValue='0.90'
            />
          </div>
        </div>

        {/* Загрузка CSV файла */}
        <div className='sidebar__section'>
          <h3 className='sidebar__section-title'>Импорт данных</h3>
          <div className='sidebar__field'>
            <label className='sidebar__label'>Загрузить CSV файл</label>
            <input
              type='file'
              accept='.csv'
              onChange={handleFileUpload}
              className='sidebar__file-input'
            />
          </div>
        </div>

        {/* Кнопки управления */}
        <div className='sidebar__actions'>
          {!calculationResult ? (
            // Кнопка первичного расчета
            <button
              className='sidebar__button'
              onClick={handleCalculate}
              disabled={isCalculating}
            >
              {isCalculating ? 'Расчет...' : 'Рассчитать'}
            </button>
          ) : (
            // Кнопки после расчета
            <div className='sidebar__button-group'>
              <button
                className='sidebar__button sidebar__button--secondary'
                onClick={handleReset}
                disabled={isCalculating}
              >
                Сбросить
              </button>
              <button
                className='sidebar__button'
                onClick={handleCalculate}
                disabled={isCalculating}
              >
                {isCalculating ? 'Расчет...' : 'Пересчитать'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
