import { SelectHTMLAttributes } from 'react'
import classNames from 'classnames'
import './Select.scss'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[]
  placeholder?: string
}

export const Select = ({
  options,
  placeholder = 'Выберите',
  className,
  value,
  ...props
}: SelectProps) => (
  <select
    className={classNames(
      'ui-select',
      { 'ui-select--empty': !value },
      className,
    )}
    value={value}
    {...props}
  >
    <option value='' disabled>
      {placeholder}
    </option>
    {options.map(option => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
)
