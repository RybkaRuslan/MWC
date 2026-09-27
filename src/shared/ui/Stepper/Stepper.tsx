import { Dispatch } from 'react'
import './Stepper.scss'

interface StepperProps {
  value: number
  onChange: Dispatch<number>
  min?: number
  max?: number
  label?: string
}

export const Stepper = ({
  value,
  onChange,
  min = 1,
  max = 10,
  label,
}: StepperProps) => (
  <div className='ui-stepper' role='group' aria-label={label}>
    <button
      type='button'
      className='ui-stepper__button'
      onClick={() => onChange(value - 1)}
      disabled={value <= min}
      aria-label='Уменьшить'
    >
      <svg width='20' height='20' viewBox='0 0 20 20' aria-hidden>
        <path d='M5 10h10' />
      </svg>
    </button>
    <span className='ui-stepper__value'>{value}</span>
    <button
      type='button'
      className='ui-stepper__button'
      onClick={() => onChange(value + 1)}
      disabled={value >= max}
      aria-label='Увеличить'
    >
      <svg width='20' height='20' viewBox='0 0 20 20' aria-hidden>
        <path d='M5 10h10M10 5v10' />
      </svg>
    </button>
  </div>
)
