import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import {
  Navbar,
  NavbarContainer,
  NavbarBrand,
  NavbarMenu,
  NavbarItem,
  NavbarToggle,
} from '../../components/ui-kit/Navbar/Navbar'

describe('Navbar Component', () => {
  it('renders navbar', () => {
    const { container } = render(
      <Navbar>
        <NavbarContainer>Content</NavbarContainer>
      </Navbar>
    )
    const navbar = container.querySelector('.navbar')
    expect(navbar).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <Navbar className="custom">
        <NavbarContainer>Content</NavbarContainer>
      </Navbar>
    )
    const navbar = container.querySelector('.navbar')
    expect(navbar).toHaveClass('custom')
  })
})

describe('NavbarContainer Component', () => {
  it('renders container', () => {
    const { container } = render(
      <Navbar>
        <NavbarContainer data-testid="container">Content</NavbarContainer>
      </Navbar>
    )
    const containerEl = container.querySelector('.navbar__container')
    expect(containerEl).toBeInTheDocument()
  })
})

describe('NavbarBrand Component', () => {
  it('renders brand as link', () => {
    render(
      <Navbar>
        <NavbarBrand href="/">Brand</NavbarBrand>
      </Navbar>
    )
    const brand = screen.getByText('Brand')
    expect(brand.tagName).toBe('A')
    expect(brand).toHaveAttribute('href', '/')
  })

  it('applies navbar__brand class', () => {
    const { container } = render(
      <Navbar>
        <NavbarBrand>Brand</NavbarBrand>
      </Navbar>
    )
    const brand = container.querySelector('.navbar__brand')
    expect(brand).toBeInTheDocument()
  })
})

describe('NavbarMenu Component', () => {
  it('renders menu', () => {
    const { container } = render(
      <Navbar>
        <NavbarMenu>Menu items</NavbarMenu>
      </Navbar>
    )
    const menu = container.querySelector('.navbar__menu')
    expect(menu).toBeInTheDocument()
  })

  it('throws error when NavbarMenu is used outside Navbar', () => {
    expect(() => render(<NavbarMenu>Menu</NavbarMenu>)).toThrow(
      'Navbar subcomponents must be used within <Navbar>'
    )
  })

  it('does not have active class initially', () => {
    const { container } = render(
      <Navbar>
        <NavbarMenu>Menu</NavbarMenu>
      </Navbar>
    )
    const menu = container.querySelector('.navbar__menu')
    expect(menu).not.toHaveClass('active')
  })
})

describe('NavbarItem Component', () => {
  it('renders item as link', () => {
    render(
      <Navbar>
        <NavbarMenu>
          <NavbarItem href="/hotels">Hotels</NavbarItem>
        </NavbarMenu>
      </Navbar>
    )
    const item = screen.getByText('Hotels')
    expect(item.tagName).toBe('A')
    expect(item).toHaveAttribute('href', '/hotels')
  })

  it('applies navbar__item class', () => {
    const { container } = render(
      <Navbar>
        <NavbarMenu>
          <NavbarItem>Item</NavbarItem>
        </NavbarMenu>
      </Navbar>
    )
    const item = container.querySelector('.navbar__item')
    expect(item).toBeInTheDocument()
  })
})

describe('NavbarToggle Component', () => {
  it('renders toggle button', () => {
    render(
      <Navbar>
        <NavbarToggle />
      </Navbar>
    )
    const toggle = screen.getByRole('button')
    expect(toggle).toBeInTheDocument()
  })

  it('throws error when NavbarToggle is used outside Navbar', () => {
    expect(() => render(<NavbarToggle />)).toThrow(
      'Navbar subcomponents must be used within <Navbar>'
    )
  })

  it('has aria-label for closed state', () => {
    render(
      <Navbar>
        <NavbarToggle />
      </Navbar>
    )
    const toggle = screen.getByRole('button')
    expect(toggle).toHaveAttribute('aria-label')
  })

  it('toggles menu on click', () => {
    const { container } = render(
      <Navbar>
        <NavbarToggle />
        <NavbarMenu>Menu</NavbarMenu>
      </Navbar>
    )
    
    const toggle = screen.getByRole('button')
    
    // Click to open
    fireEvent.click(toggle)
    let menu = container.querySelector('.navbar__menu')
    expect(menu).toHaveClass('active')
    
    // Click to close
    fireEvent.click(toggle)
    menu = container.querySelector('.navbar__menu')
    expect(menu).not.toHaveClass('active')
  })

  it('updates aria-expanded on toggle', () => {
    render(
      <Navbar>
        <NavbarToggle />
      </Navbar>
    )
    
    const toggle = screen.getByRole('button')
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })
})