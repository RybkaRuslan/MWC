// Импорт иконок
import noDataIcon from './no_data.png'
import noVisualIcon from './no_visual.png'
import logoIcon from './logo.png'

// Типы иконок
export interface IconAssets {
  noData: string
  noVisual: string
  logo: string
}

// Экспорт иконок
export const icons: IconAssets = {
  noData: noDataIcon,
  noVisual: noVisualIcon,
  logo: logoIcon,
}

// Экспорт для удобства
export { noDataIcon, noVisualIcon, logoIcon }
