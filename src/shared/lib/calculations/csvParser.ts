import { CalculationInput } from './types'
import { STEEL_MATERIALS, BOLT_STRENGTH_CLASSES } from './constants'

export interface ParsedCSVData {
  input: CalculationInput
  originalData: string[][]
  errors: string[]
}

/**
 * Парсер CSV файлов RUSPAN
 */
export function parseRUSPANCSV(csvContent: string): ParsedCSVData {
  const errors: string[] = []
  const lines = csvContent.split('\n')
  const data: string[][] = []

  // Парсинг CSV с учетом разделителя ';'
  for (const line of lines) {
    if (line.trim()) {
      data.push(line.split(';'))
    }
  }

  try {
    const input = extractCalculationInput(data)
    return {
      input,
      originalData: data,
      errors,
    }
  } catch (error) {
    errors.push(
      `Ошибка парсинга: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
    )
    return {
      input: createDefaultInput(),
      originalData: data,
      errors,
    }
  }
}

/**
 * Извлечение параметров расчета из CSV данных
 */
function extractCalculationInput(data: string[][]): CalculationInput {
  const params: Record<string, any> = {}

  // Поиск параметров в CSV данных
  for (let i = 0; i < Math.min(data.length, 50); i++) {
    const row = data[i]
    if (!row || row.length < 5) continue

    // Количество рядов по X
    if (row.some(cell => cell.includes('Кол-во рядов по X'))) {
      const xValue = findValueInRow(row, 'Кол-во рядов по X')
      params.boltRowsX = xValue ? parseInt(xValue) || 5 : 5
    }

    // Количество рядов по Y
    if (row.some(cell => cell.includes('Кол-во рядов по Y'))) {
      const yValue = findValueInRow(row, 'Кол-во рядов по Y')
      params.boltRowsY = yValue ? parseInt(yValue) || 3 : 3
    }

    // Нагрузки
    if (row.some(cell => cell.includes('N, тс'))) {
      const nValue = findValueInRow(row, 'N, тс')
      params.forceN = nValue ? parseFloat(nValue.replace(',', '.')) || 0 : 0
    }

    if (row.some(cell => cell.includes('M, тс*м'))) {
      const mValue = findValueInRow(row, 'M, тс*м')
      params.forceM = mValue ? parseFloat(mValue.replace(',', '.')) || 0 : 0
    }

    if (row.some(cell => cell.includes('Q, тс'))) {
      const qValue = findValueInRow(row, 'Q, тс')
      params.forceQ = qValue ? parseFloat(qValue.replace(',', '.')) || 0 : 0
    }

    // Материал профиля
    if (row.some(cell => cell.includes('Профиль'))) {
      const thicknessMatch = findValueInRow(row, 't, мм')
      if (thicknessMatch) {
        params.profileThickness = parseFloat(thicknessMatch.replace(',', '.'))
      }

      const steelMatch = findValueInRow(row, 'Сталь')
      if (steelMatch) {
        params.profileSteel = steelMatch
      }
    }

    // Материал фасонки
    if (row.some(cell => cell.includes('Фасонка'))) {
      const thicknessMatch = findValueInRow(row, 't, мм')
      if (thicknessMatch) {
        params.plateThickness = parseFloat(thicknessMatch.replace(',', '.'))
      }

      const steelMatch = findValueInRow(row, 'Сталь')
      if (steelMatch) {
        params.plateSteel = steelMatch
      }
    }

    // Болты
    if (row.some(cell => cell.includes('Болты'))) {
      const diameterMatch = findValueInRow(row, 'd =')
      if (diameterMatch) {
        params.boltDiameter = parseInt(diameterMatch)
      }
    }

    // Класс прочности
    if (row.some(cell => cell.includes('Класс прочности'))) {
      const classMatch = findValueInRow(row, 'Класс прочности')
      if (classMatch) {
        params.boltClass = classMatch
      }
    }

    // Размеры
    if (row.some(cell => cell.includes('h, мм'))) {
      const heightMatch = findValueInRow(row, 'h, мм')
      if (heightMatch) {
        params.plateHeight = parseFloat(heightMatch.replace(',', '.'))
      }
    }

    if (row.some(cell => cell.includes('h1, мм'))) {
      const widthMatch = findValueInRow(row, 'h1, мм')
      if (widthMatch) {
        params.plateWidth = parseFloat(widthMatch.replace(',', '.'))
      }
    }

    if (row.some(cell => cell.includes('ku ='))) {
      const kuMatch = findValueInRow(row, 'ku =')
      if (kuMatch) {
        params.utilizationFactor = parseFloat(kuMatch.replace(',', '.'))
      }
    }
  }

  // Поиск расстояний между болтами
  const boltSpacing = extractBoltSpacing(data)

  return {
    boltRows: {
      x: params.boltRowsX || 5,
      y: params.boltRowsY || 3,
    },
    boltSpacing: boltSpacing,
    profile: {
      thickness: params.profileThickness || 2.5,
      material: STEEL_MATERIALS[params.profileSteel] || STEEL_MATERIALS['С390'],
    },
    plate: {
      thickness: params.plateThickness || 12,
      material: STEEL_MATERIALS[params.plateSteel] || STEEL_MATERIALS['С345'],
    },
    bolt: {
      diameter: params.boltDiameter || 16,
      strengthClass:
        BOLT_STRENGTH_CLASSES[params.boltClass] || BOLT_STRENGTH_CLASSES['5.6'],
    },
    forces: {
      N: params.forceN || 0,
      M: params.forceM || 0,
      Q: params.forceQ || 0,
    },
    connectionType: '2S', // по умолчанию двухстороннее
    plateHeight: params.plateHeight || 350,
    plateWidth: params.plateWidth || 250,
    utilizationFactor: params.utilizationFactor || 0.54,
  }
}

/**
 * Поиск значения в строке по ключу
 */
function findValueInRow(row: string[], key: string): string | null {
  for (let i = 0; i < row.length; i++) {
    if (row[i].includes(key)) {
      // Пытаемся найти значение в соседних ячейках
      for (let j = i + 1; j < Math.min(i + 5, row.length); j++) {
        const value = row[j]?.trim()
        if (
          value &&
          value !== '' &&
          !isNaN(parseFloat(value.replace(',', '.')))
        ) {
          return value
        }
      }
    }
  }
  return null
}

/**
 * Извлечение расстояний между болтами
 */
function extractBoltSpacing(data: string[][]): { x: number[]; y: number[] } {
  const spacing = { x: [100, 160, 160, 90], y: [250, 150] } // значения по умолчанию

  // Поиск таблицы с расстояниями
  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    if (row?.some(cell => cell.includes('X1 ='))) {
      // Извлекаем расстояния по X
      const xValues = []
      for (let j = 0; j < row.length; j++) {
        if (row[j] && row[j].includes('X') && row[j].includes('=')) {
          const nextCell = row[j + 1]
          if (nextCell) {
            const value = parseInt(nextCell.trim())
            if (!isNaN(value)) {
              xValues.push(value)
            }
          }
        }
      }
      if (xValues.length > 0) {
        spacing.x = xValues
      }
    }

    if (row?.some(cell => cell.includes('Y1 ='))) {
      // Извлекаем расстояния по Y
      const yValues = []
      for (let j = 0; j < row.length; j++) {
        if (row[j] && row[j].includes('Y') && row[j].includes('=')) {
          const nextCell = row[j + 1]
          if (nextCell) {
            const value = parseInt(nextCell.trim())
            if (!isNaN(value)) {
              yValues.push(value)
            }
          }
        }
      }
      if (yValues.length > 0) {
        spacing.y = yValues
      }
    }
  }

  return spacing
}

/**
 * Создание входных данных по умолчанию
 */
function createDefaultInput(): CalculationInput {
  return {
    boltRows: { x: 5, y: 3 },
    boltSpacing: { x: [100, 160, 160, 90], y: [250, 150] },
    profile: {
      thickness: 2.5,
      material: STEEL_MATERIALS['С390'],
    },
    plate: {
      thickness: 12,
      material: STEEL_MATERIALS['С345'],
    },
    bolt: {
      diameter: 16,
      strengthClass: BOLT_STRENGTH_CLASSES['5.6'],
    },
    forces: {
      N: 39.6,
      M: 1.0,
      Q: 2.9,
    },
    connectionType: '2S',
    plateHeight: 350,
    plateWidth: 250,
    utilizationFactor: 0.54,
  }
}
