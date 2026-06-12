import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { createRef } from 'react'
import { Input, InputGroup } from '../../components/ui-kit/Input/Input'

describe('Input Component', () => {
  it('renders input element', () => {
    render(<Input placeholder="Введите email" />)
    expect(screen.getByPlaceholderText(/введите email/i)).toBeInTheDocument()
  })

  it('passes all standard input props', () => {
    render(<Input type="email" value="test@example.com" readOnly />)
    const input = screen.getByDisplayValue(/test@example.com/i)
    expect(input).toHaveAttribute('type', 'email')
    expect(input).toHaveAttribute('readonly')
  })

  it('handles onChange events', () => {
    const handleChange = vi.fn()
    render(<Input onChange={handleChange} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'new value' } })
    
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('can be disabled', () => {
    render(<Input disabled placeholder="disabled" />)
    expect(screen.getByPlaceholderText(/disabled/i)).toBeDisabled()
  })

  it('applies custom className', () => {
    render(<Input className="custom-class" data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveClass('custom-class')
  })

  it('supports ref forwarding', () => {
    const ref = createRef<HTMLInputElement>()
    render(<Input ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })
})

describe('InputGroup Component', () => {
  it('renders children', () => {
    render(
      <InputGroup>
        <Input placeholder="child input" />
      </InputGroup>
    )
    expect(screen.getByPlaceholderText(/child input/i)).toBeInTheDocument()
  })

  it('renders icon when provided', () => {
    const TestIcon = () => <span data-testid="test-icon">🔍</span>
    render(
      <InputGroup icon={<TestIcon />}>
        <Input />
      </InputGroup>
    )
    expect(screen.getByTestId('test-icon')).toBeInTheDocument()
  })

  it('does not render icon when not provided', () => {
    render(
      <InputGroup>
        <Input />
      </InputGroup>
    )
    expect(screen.queryByTestId('test-icon')).not.toBeInTheDocument()
  })

  it('shows error message when error is true', () => {
    render(
      <InputGroup error errorMessage="Неверный email">
        <Input />
      </InputGroup>
    )
    expect(screen.getByText(/неверный email/i)).toBeInTheDocument()
  })

  it('does not show error message when error is false', () => {
    render(
      <InputGroup error={false} errorMessage="Неверный email">
        <Input />
      </InputGroup>
    )
    expect(screen.queryByText(/неверный email/i)).not.toBeInTheDocument()
  })

  it('applies error class when error is true', () => {
    const { container } = render(
      <InputGroup error errorMessage="Ошибка">
        <Input />
      </InputGroup>
    )
    const group = container.querySelector('.input-group')
    expect(group).toHaveClass('input-group--error')
  })

  it('applies custom className', () => {
    const { container } = render(
      <InputGroup className="custom-group">
        <Input />
      </InputGroup>
    )
    const group = container.querySelector('.input-group')
    expect(group).toHaveClass('custom-group')
  })
})