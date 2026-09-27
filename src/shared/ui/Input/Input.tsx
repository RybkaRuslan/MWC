import { InputHTMLAttributes } from 'react'
import classNames from 'classnames'
import './Input.scss'

export const Input = ({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) => (
  <input className={classNames('ui-input', className)} {...props} />
)
