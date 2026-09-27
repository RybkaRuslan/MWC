// Типы для расчета болтовых соединений

export interface BoltCoordinates {
  x: number
  y: number
  isActive: boolean
}

export interface Material {
  name: string
  type: 'С245' | 'С345' | 'С375' | 'С390'
  strength: number // Н/мм²
}

export interface BoltStrengthClass {
  class: '5.6' | '5.8' | '8.8' | '10.9'
  shearStrength: number // Н/мм² (Rbs)
  bearingStrength: number // Н/мм² (Rbp)
}

export interface CalculationInput {
  // Геометрия болтового поля
  boltRows: {
    x: number
    y: number
  }
  boltSpacing: {
    x: number[]
    y: number[]
  }

  // Материалы
  profile: {
    thickness: number // мм
    material: Material
  }
  plate: {
    thickness: number // мм
    material: Material
  }

  // Болты
  bolt: {
    diameter: number // мм
    strengthClass: BoltStrengthClass
  }

  // Нагрузки
  forces: {
    N: number // тс (осевая сила)
    M: number // тс*м (изгибающий момент)
    Q: number // тс (поперечная сила)
  }

  // Дополнительные параметры
  connectionType: '1S' | '2S' | '2Z' // тип соединения
  plateHeight: number // мм
  plateWidth: number // мм
}

export interface BoltForces {
  index: number
  coordinates: BoltCoordinates
  forces: {
    fromAxial: { x: number; y: number } // от осевой силы N, тс
    fromMoment: { x: number; y: number } // от момента M, тс
    fromShear: { x: number; y: number } // от поперечной силы Q, тс
    resultant: { x: number; y: number; magnitude: number } // результирующая, тс
  }
}

export interface GeometryProperties {
  centerOfGravity: { x: number; y: number }
  momentOfInertia: { Ix: number; Iy: number; Ixy: number }
  area: number
  maxDistance: number
}

export interface CapacityCheck {
  type: 'shear' | 'bearing-profile' | 'bearing-plate'
  capacity: number // тс
  demand: number // тс
  utilization: number // коэффициент использования
  isAcceptable: boolean
}

export interface CalculationResult {
  input: CalculationInput
  geometry: GeometryProperties
  boltForces: BoltForces[]
  maxBoltForce: {
    value: number // тс
    boltIndex: number
    coordinates: BoltCoordinates
  }
  capacityChecks: CapacityCheck[]
  plateUtilization: number // коэффициент использования фасонки ku
  summary: {
    isAcceptable: boolean
    criticalCheck: CapacityCheck
    recommendations?: string[]
  }
}
