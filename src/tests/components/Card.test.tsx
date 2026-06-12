import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card, CardImage, CardContent, CardTitle, CardText } from '../../components/ui-kit/Card/Card'

describe('Card Component', () => {
  it('renders card with default class', () => {
    const { container } = render(<Card data-testid="card">Content</Card>)
    const card = container.querySelector('.card')
    expect(card).toBeInTheDocument()
    expect(card).toHaveTextContent('Content')
  })

  it('applies size class', () => {
    const { container } = render(<Card size="large">Content</Card>)
    const card = container.querySelector('.card')
    expect(card).toHaveClass('card--large')
  })

  it('applies custom className', () => {
    const { container } = render(<Card className="custom">Content</Card>)
    const card = container.querySelector('.card')
    expect(card).toHaveClass('custom')
  })

  it('passes all props to div', () => {
    render(<Card data-testid="card" id="test-id">Content</Card>)
    const card = screen.getByTestId('card')
    expect(card).toHaveAttribute('id', 'test-id')
  })
})

describe('CardImage Component', () => {
  it('renders image with src', () => {
    render(<CardImage src="test.jpg" alt="Test" />)
    const img = screen.getByAltText('Test')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'test.jpg')
  })

  it('applies card__image class', () => {
    const { container } = render(<CardImage src="test.jpg" alt="Test" />)
    const img = container.querySelector('.card__image')
    expect(img).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<CardImage src="test.jpg" className="custom" alt="Test" />)
    const img = container.querySelector('.card__image')
    expect(img).toHaveClass('custom')
  })
})

describe('CardContent Component', () => {
  it('renders content', () => {
    render(<CardContent data-testid="content">Test content</CardContent>)
    expect(screen.getByTestId('content')).toHaveTextContent('Test content')
  })
})

describe('CardTitle Component', () => {
  it('renders h3 with title', () => {
    render(<CardTitle>Hotel Title</CardTitle>)
    const title = screen.getByRole('heading', { level: 3 })
    expect(title).toHaveTextContent('Hotel Title')
  })

  it('applies card__title class', () => {
    const { container } = render(<CardTitle>Title</CardTitle>)
    const title = container.querySelector('.card__title')
    expect(title).toBeInTheDocument()
  })
})

describe('CardText Component', () => {
  it('renders paragraph with text', () => {
    render(<CardText>Description text</CardText>)
    const text = screen.getByText('Description text')
    expect(text.tagName).toBe('P')
  })

  it('applies card__text class', () => {
    const { container } = render(<CardText>Text</CardText>)
    const text = container.querySelector('.card__text')
    expect(text).toBeInTheDocument()
  })
})