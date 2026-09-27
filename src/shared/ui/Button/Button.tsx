import { ButtonHTMLAttributes } from 'react'
import classNames from 'classnames'
import './Button.scss'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
}

export const Button = ({
  variant = 'primary',
  className,
  type = 'button',
  ...props
}: ButtonProps) => (
  <button
    type={type}
    className={classNames('ui-button', `ui-button--${variant}`, className)}
    {...props}
  />
)
