import { Sidebar } from '@widgets/Sidebar'
import { CalculationResults } from '@widgets/CalculationResults'
import { Visualization } from '@widgets/Visualization'
import './App.scss'

export const App = () => {
  return (
    <div className='app'>
      <div className='app__header'>
        <div className='app__logo'>
          <span className='app__logo-text'>RUSPAN</span>
          <span className='app__subtitle'>Калькулятор</span>
        </div>
      </div>
      <div className='app__content'>
        <Sidebar />
        <CalculationResults />
        <Visualization />
      </div>
    </div>
  )
}
