import {
  CalculationInput,
  CalculationResult,
  BoltCoordinates,
  BoltForces,
  GeometryProperties,
  CapacityCheck,
} from './types'
import {
  BOLT_CROSS_SECTION_AREAS,
  BEARING_STRENGTH,
  CONNECTION_TYPES,
  SAFETY_FACTORS,
} from './constants'

/**
 * Главная функция расчета болтового соединения
 */
export function calculateBoltConnection(
  input: CalculationInput,
): CalculationResult {
  // 1. Создание сетки болтов
  const boltCoordinates = generateBoltGrid(input)

  // 2. Расчет геометрических характеристик болтового поля
  const geometry = calculateGeometryProperties(boltCoordinates)

  // 3. Расчет усилий в каждом болте
  const boltForces = calculateBoltForces(input, boltCoordinates, geometry)

  // 4. Определение максимального усилия
  const maxBoltForce = findMaxBoltForce(boltForces)

  // 5. Проверки несущей способности
  const capacityChecks = performCapacityChecks(input, maxBoltForce.value)

  // 6. Формирование итогового результата
  const summary = generateSummary(capacityChecks)

  return {
    input,
    geometry,
    boltForces,
    maxBoltForce,
    capacityChecks,
    summary,
  }
}

/**
 * Создание сетки координат болтов
 */
function generateBoltGrid(input: CalculationInput): BoltCoordinates[] {
  const bolts: BoltCoordinates[] = []

  // Накопительные координаты
  let currentY = 0

  for (let row = 0; row < input.boltRows.y; row++) {
    let currentX = 0

    for (let col = 0; col < input.boltRows.x; col++) {
      bolts.push({
        x: currentX,
        y: currentY,
        isActive: true,
      })

      // Переход к следующему болту по X
      if (col < input.boltSpacing.x.length) {
        currentX += input.boltSpacing.x[col]
      }
    }

    // Переход к следующему ряду по Y
    if (row < input.boltSpacing.y.length) {
      currentY += input.boltSpacing.y[row]
    }
  }

  return bolts
}

/**
 * Расчет геометрических характеристик болтового поля
 */
function calculateGeometryProperties(
  bolts: BoltCoordinates[],
): GeometryProperties {
  const activeBolts = bolts.filter(bolt => bolt.isActive)
  const n = activeBolts.length

  // Центр тяжести
  const sumX = activeBolts.reduce((sum, bolt) => sum + bolt.x, 0)
  const sumY = activeBolts.reduce((sum, bolt) => sum + bolt.y, 0)

  const centerOfGravity = {
    x: sumX / n,
    y: sumY / n,
  }

  // Моменты инерции относительно центра тяжести
  let Ix = 0
  let Iy = 0
  let Ixy = 0

  for (const bolt of activeBolts) {
    const dx = bolt.x - centerOfGravity.x
    const dy = bolt.y - centerOfGravity.y

    Ix += dy * dy
    Iy += dx * dx
    Ixy += dx * dy
  }

  // Максимальное расстояние от центра тяжести
  const maxDistance = Math.max(
    ...activeBolts.map(bolt => {
      const dx = bolt.x - centerOfGravity.x
      const dy = bolt.y - centerOfGravity.y
      return Math.sqrt(dx * dx + dy * dy)
    }),
  )

  return {
    centerOfGravity,
    momentOfInertia: { Ix, Iy, Ixy },
    area: n,
    maxDistance,
  }
}

/**
 * Расчет усилий в каждом болте
 */
function calculateBoltForces(
  input: CalculationInput,
  bolts: BoltCoordinates[],
  geometry: GeometryProperties,
): BoltForces[] {
  const { forces } = input
  const { centerOfGravity, momentOfInertia, area } = geometry
  const activeBolts = bolts.filter(bolt => bolt.isActive)

  return activeBolts.map((bolt, index) => {
    const dx = bolt.x - centerOfGravity.x
    const dy = bolt.y - centerOfGravity.y

    // Усилия от осевой силы N (равномерно распределены)
    const fromAxial = {
      x: 0,
      y: (-forces.N * 1000) / area, // переводим тс в кг и распределяем
    }

    // Усилия от момента M
    const M_Nmm = forces.M * 1000 * 1000 // переводим тс*м в кг*мм
    const fromMoment = {
      x: -(M_Nmm * dy) / momentOfInertia.Iy,
      y: (M_Nmm * dx) / momentOfInertia.Ix,
    }

    // Усилия от поперечной силы Q (равномерно распределены)
    const fromShear = {
      x: (-forces.Q * 1000) / area, // переводим тс в кг
      y: 0,
    }

    // Результирующая
    const resultantX = fromAxial.x + fromMoment.x + fromShear.x
    const resultantY = fromAxial.y + fromMoment.y + fromShear.y
    const magnitude =
      Math.sqrt(resultantX * resultantX + resultantY * resultantY) / 1000 // обратно в тс

    return {
      index,
      coordinates: bolt,
      forces: {
        fromAxial,
        fromMoment,
        fromShear,
        resultant: {
          x: resultantX,
          y: resultantY,
          magnitude,
        },
      },
    }
  })
}

/**
 * Поиск максимального усилия в болтах
 */
function findMaxBoltForce(boltForces: BoltForces[]) {
  let maxForce = 0
  let maxIndex = 0

  boltForces.forEach((bolt, index) => {
    if (bolt.forces.resultant.magnitude > maxForce) {
      maxForce = bolt.forces.resultant.magnitude
      maxIndex = index
    }
  })

  return {
    value: maxForce,
    boltIndex: maxIndex,
    coordinates: boltForces[maxIndex].coordinates,
  }
}

/**
 * Проверки несущей способности
 */
function performCapacityChecks(
  input: CalculationInput,
  maxBoltForce: number,
): CapacityCheck[] {
  const checks: CapacityCheck[] = []

  // 1. Проверка на срез болтов
  const boltArea = BOLT_CROSS_SECTION_AREAS[input.bolt.diameter] || 0
  const shearPlanes = CONNECTION_TYPES[input.connectionType].shearPlanes
  const shearCapacity =
    (input.bolt.strengthClass.shearStrength *
      boltArea *
      shearPlanes *
      SAFETY_FACTORS.gammaB) /
    100 // тс

  checks.push({
    type: 'shear',
    capacity: shearCapacity,
    demand: maxBoltForce,
    utilization: maxBoltForce / shearCapacity,
    isAcceptable: maxBoltForce <= shearCapacity,
  })

  // 2. Проверка на смятие профиля
  const profileBearingCapacity =
    (BEARING_STRENGTH[input.profile.material.type] *
      input.bolt.diameter *
      input.profile.thickness *
      SAFETY_FACTORS.gammaC) /
    100000 // тс

  checks.push({
    type: 'bearing-profile',
    capacity: profileBearingCapacity,
    demand: maxBoltForce,
    utilization: maxBoltForce / profileBearingCapacity,
    isAcceptable: maxBoltForce <= profileBearingCapacity,
  })

  // 3. Проверка на смятие фасонки
  const plateBearingCapacity =
    (BEARING_STRENGTH[input.plate.material.type] *
      input.bolt.diameter *
      input.plate.thickness *
      SAFETY_FACTORS.gammaC) /
    100000 // тс

  checks.push({
    type: 'bearing-plate',
    capacity: plateBearingCapacity,
    demand: maxBoltForce,
    utilization: maxBoltForce / plateBearingCapacity,
    isAcceptable: maxBoltForce <= plateBearingCapacity,
  })

  return checks
}

/**
 * Формирование итогового заключения
 */
function generateSummary(checks: CapacityCheck[]) {
  const failedChecks = checks.filter(check => !check.isAcceptable)
  const criticalCheck = checks.reduce((max, check) =>
    check.utilization > max.utilization ? check : max,
  )

  const recommendations: string[] = []

  if (failedChecks.length > 0) {
    recommendations.push(
      'Соединение не проходит проверку по несущей способности',
    )

    failedChecks.forEach(check => {
      switch (check.type) {
        case 'shear':
          recommendations.push('Увеличить диаметр болтов или класс прочности')
          break
        case 'bearing-profile':
          recommendations.push('Увеличить толщину профиля или класс стали')
          break
        case 'bearing-plate':
          recommendations.push('Увеличить толщину фасонки или класс стали')
          break
      }
    })
  }

  return {
    isAcceptable: failedChecks.length === 0,
    criticalCheck,
    recommendations: recommendations.length > 0 ? recommendations : undefined,
  }
}
