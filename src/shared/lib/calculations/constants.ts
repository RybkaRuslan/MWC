import { Material, BoltStrengthClass } from './types'

// Материалы сталей согласно российским стандартам
export const STEEL_MATERIALS: Record<string, Material> = {
  С245: {
    name: 'С245',
    type: 'С245',
    strength: 245,
  },
  С345: {
    name: 'С345',
    type: 'С345',
    strength: 345,
  },
  С375: {
    name: 'С375',
    type: 'С375',
    strength: 375,
  },
  С390: {
    name: 'С390',
    type: 'С390',
    strength: 390,
  },
}

// Расчетные сопротивления для смятия (Rbp) в Н/мм²
export const BEARING_STRENGTH: Record<string, number> = {
  С245: 495,
  С345: 620,
  С375: 645,
  С390: 710,
}

// Классы прочности болтов
export const BOLT_STRENGTH_CLASSES: Record<string, BoltStrengthClass> = {
  '5.6': {
    class: '5.6',
    shearStrength: 210, // Rbs в Н/мм²
    bearingStrength: 495, // Rbp в Н/мм²
  },
  '5.8': {
    class: '5.8',
    shearStrength: 210,
    bearingStrength: 495,
  },
  '8.8': {
    class: '8.8',
    shearStrength: 330,
    bearingStrength: 645,
  },
  '10.9': {
    class: '10.9',
    shearStrength: 415,
    bearingStrength: 710,
  },
}

// Площади поперечного сечения болтов (Abn) в см²
export const BOLT_CROSS_SECTION_AREAS: Record<number, number> = {
  12: 0.76,
  16: 1.57,
  18: 1.92,
  20: 2.45,
  22: 3.03,
  24: 3.53,
  27: 4.59,
  30: 5.61,
}

// Коэффициенты условий работы
export const SAFETY_FACTORS = {
  gammaC: 0.9, // коэффициент условий работы соединения
  gammaB: 0.9, // коэффициент условий работы болтов
  gammaM: 1.0, // коэффициент надежности по материалу
}

// Типы соединений и количество расчетных срезов
export const CONNECTION_TYPES = {
  '1S': { name: 'Односрезное', shearPlanes: 1 },
  '2S': { name: 'Двухсрезное симметричное', shearPlanes: 2 },
  '2Z': { name: 'Двухсрезное несимметричное', shearPlanes: 2 },
}

// Минимальные расстояния между болтами (мм)
export const MIN_BOLT_SPACING = {
  edge: 30, // от края
  center: 60, // между центрами болтов
}

// Максимальные расстояния между болтами (мм)
export const MAX_BOLT_SPACING = {
  edge: 100,
  center: 200,
}
