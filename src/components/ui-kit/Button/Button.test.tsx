import { render, screen } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders label', () => {
    render(<Button>Забронировать</Button>)
    expect(screen.getByRole('button', { name: 'Забронировать' })).toBeInTheDocument()
  })
})
