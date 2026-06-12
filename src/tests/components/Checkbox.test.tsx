import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Checkbox } from '../../components/ui-kit/Checkbox/Checkbox'

describe('Checkbox Component', () => {
  it('renders checkbox input', () => {
    render(<Checkbox />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeInTheDocument()
  })

  it('renders with label', () => {
    render(<Checkbox label="Accept terms" />)
    expect(screen.getByLabelText('Accept terms')).toBeInTheDocument()
  })

  it('uses label as id when id not provided', () => {
    render(<Checkbox label="Test label" />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveAttribute('id', 'Test label')
  })

  it('uses provided id', () => {
    render(<Checkbox id="custom-id" label="Label" />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveAttribute('id', 'custom-id')
  })

  it('handles onChange events', () => {
    const handleChange = vi.fn()
    render(<Checkbox onChange={handleChange} />)
    
    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)
    
    expect(handleChange).toHaveBeenCalled()
  })

  it('can be checked', () => {
    render(<Checkbox checked onChange={() => {}} />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()
  })

  it('can be disabled', () => {
    render(<Checkbox disabled />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeDisabled()
  })

  it('applies custom className', () => {
    render(<Checkbox className="custom" data-testid="checkbox" />)
    const checkbox = screen.getByTestId('checkbox')
    expect(checkbox).toHaveClass('custom')
  })

  it('does not render label when not provided', () => {
    const { container } = render(<Checkbox />)
    const label = container.querySelector('label')
    expect(label).not.toBeInTheDocument()
  })
})