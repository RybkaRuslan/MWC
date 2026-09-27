import { Sidebar } from '@widgets/Sidebar'
import { CalculationResults } from '@widgets/CalculationResults'
import { Visualization } from '@widgets/Visualization'
import { CalculationProvider } from '@shared/context/CalculationContext'
import './App.scss'

export const App = () => {
  return (
    <CalculationProvider>
      <div className='app'>
        <aside className='app__sidebar'>
          <Sidebar />
        </aside>
        <section className='app__results'>
          <CalculationResults />
        </section>
        <section className='app__visualization'>
          <Visualization />
        </section>
      </div>
    </CalculationProvider>
  )
}
