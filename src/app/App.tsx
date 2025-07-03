import { Sidebar } from '@widgets/Sidebar'
import { CalculationResults } from '@widgets/CalculationResults'
import { Visualization } from '@widgets/Visualization'
import { CalculationProvider } from '@shared/context/CalculationContext'
import { logoIcon } from '@shared/assets/icons'
import './App.scss'

export const App = () => {
  return (
    <CalculationProvider>
      <div className='app'>
        <div className='app__header'>
          <div className='app__logo'>
            <img src={logoIcon} alt='RUSPAN' className='app__logo-image' />
            <span className='app__subtitle'>Калькулятор</span>
          </div>
        </div>
        <div className='app__content'>
          <Sidebar />
          <CalculationResults />
          <Visualization />
        </div>
      </div>
    </CalculationProvider>
  )
}
