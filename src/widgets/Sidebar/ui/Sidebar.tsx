import { useState } from 'react'
import './Sidebar.scss'

export const Sidebar = () => {
  const [formData, setFormData] = useState({
    // Базовые элементы
    baseType: '',
    baseConfiguration: '',

    // Расположение болтов
    boltCount: { x: '', y: '' },

    // Параметры элементов узла
    profile: { name: '', steel: '' },
    fascia: { name: '', steel: '' },
    boltDiameter: '',
    proxyCert: '',

    // Условия в узле
    longitudinalForce: '',
    moment: '',
    transverseForce: '',
    forceCoefficient: '',

    // Параметры фасонного элемента
    height: '',
  })

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

  const handleCalculate = () => {
    // console.log('Расчет с данными:', formData)
    // Здесь будет логика расчета
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
            <label className='sidebar__label'>Профиль</label>
            <input
              type='text'
              className='sidebar__input'
              value={formData.profile.name}
              onChange={e =>
                handleNestedInputChange('profile', 'name', e.target.value)
              }
              placeholder='Введите профиль'
            />
            <select
              className='sidebar__select'
              value={formData.profile.steel}
              onChange={e =>
                handleNestedInputChange('profile', 'steel', e.target.value)
              }
            >
              <option value=''>Сталь</option>
              <option value='steel1'>Сталь 1</option>
              <option value='steel2'>Сталь 2</option>
            </select>
          </div>
          <div className='sidebar__field'>
            <label className='sidebar__label'>Фасонка</label>
            <input
              type='text'
              className='sidebar__input'
              value={formData.fascia.name}
              onChange={e =>
                handleNestedInputChange('fascia', 'name', e.target.value)
              }
              placeholder='Введите фасонку'
            />
            <select
              className='sidebar__select'
              value={formData.fascia.steel}
              onChange={e =>
                handleNestedInputChange('fascia', 'steel', e.target.value)
              }
            >
              <option value=''>Сталь</option>
              <option value='steel1'>Сталь 1</option>
              <option value='steel2'>Сталь 2</option>
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
              <option value='class1'>Класс 1</option>
              <option value='class2'>Класс 2</option>
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
            <label className='sidebar__label'>Nв** = 2,01 тс</label>
            <input
              type='number'
              className='sidebar__input'
              value={formData.forceCoefficient}
              onChange={e =>
                handleInputChange('forceCoefficient', e.target.value)
              }
              placeholder='Коэффициент'
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
            />
          </div>
          <div className='sidebar__field'>
            <label className='sidebar__label'>кт = 0,90</label>
            <input
              type='number'
              className='sidebar__input'
              placeholder='Коэффициент'
              defaultValue='0.90'
            />
          </div>
        </div>

        {/* Кнопка расчета */}
        <button className='sidebar__button' onClick={handleCalculate}>
          Рассчитать
        </button>
      </div>
    </div>
  )
}
