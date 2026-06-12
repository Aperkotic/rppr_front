import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Radio } from '../../components/ui-kit/Radio/Radio'

describe('Radio Component', () => {
  it('renders radio input', () => {
    render(<Radio name="test" />)
    const radio = screen.getByRole('radio')
    expect(radio).toBeInTheDocument()
  })

  it('renders with label', () => {
    render(<Radio label="Option 1" name="test" />)
    expect(screen.getByLabelText('Option 1')).toBeInTheDocument()
  })

  it('uses label as id when id not provided', () => {
    render(<Radio label="Test label" name="test" />)
    const radio = screen.getByRole('radio')
    expect(radio).toHaveAttribute('id', 'Test label')
  })

  it('uses provided id', () => {
    render(<Radio id="custom-id" label="Label" name="test" />)
    const radio = screen.getByRole('radio')
    expect(radio).toHaveAttribute('id', 'custom-id')
  })

  it('handles onChange events', () => {
    const handleChange = vi.fn()
    render(<Radio onChange={handleChange} name="test" />)
    
    const radio = screen.getByRole('radio')
    fireEvent.click(radio)
    
    expect(handleChange).toHaveBeenCalled()
  })

  it('can be checked', () => {
    render(<Radio checked onChange={() => {}} name="test" />)
    const radio = screen.getByRole('radio')
    expect(radio).toBeChecked()
  })

  it('can be disabled', () => {
    render(<Radio disabled name="test" />)
    const radio = screen.getByRole('radio')
    expect(radio).toBeDisabled()
  })

  it('applies custom className', () => {
    render(<Radio className="custom" data-testid="radio" name="test" />)
    const radio = screen.getByTestId('radio')
    expect(radio).toHaveClass('custom')
  })

  it('does not render label when not provided', () => {
    const { container } = render(<Radio name="test" />)
    const label = container.querySelector('label')
    expect(label).not.toBeInTheDocument()
  })
})