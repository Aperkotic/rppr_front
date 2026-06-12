import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from '../../components/ui-kit/Dropdown/Dropdown'

describe('Dropdown Component', () => {
  it('renders dropdown container', () => {
    const { container } = render(
      <Dropdown>
        <DropdownToggle>Toggle</DropdownToggle>
        <DropdownMenu>Menu</DropdownMenu>
      </Dropdown>
    )
    const dropdown = container.querySelector('.dropdown')
    expect(dropdown).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <Dropdown className="custom">
        <DropdownToggle>Toggle</DropdownToggle>
      </Dropdown>
    )
    const dropdown = container.querySelector('.dropdown')
    expect(dropdown).toHaveClass('custom')
  })
})

describe('DropdownToggle Component', () => {
  it('renders toggle button', () => {
    render(
      <Dropdown>
        <DropdownToggle>Click me</DropdownToggle>
      </Dropdown>
    )
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('throws error when DropdownToggle is used outside Dropdown', () => {
    expect(() => render(<DropdownToggle>Toggle</DropdownToggle>)).toThrow(
      'Dropdown subcomponents must be used within <Dropdown>'
    )
  })

  it('has button role', () => {
    render(
      <Dropdown>
        <DropdownToggle>Toggle</DropdownToggle>
      </Dropdown>
    )
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('is focusable with tabIndex', () => {
    render(
      <Dropdown>
        <DropdownToggle>Toggle</DropdownToggle>
      </Dropdown>
    )
    const toggle = screen.getByRole('button')
    expect(toggle).toHaveAttribute('tabindex', '0')
  })

  it('opens menu on click', () => {
    const { container } = render(
      <Dropdown>
        <DropdownToggle>Toggle</DropdownToggle>
        <DropdownMenu>Menu content</DropdownMenu>
      </Dropdown>
    )
    
    const toggle = screen.getByText('Toggle')
    fireEvent.click(toggle)
    
    const menu = container.querySelector('.dropdown__menu')
    expect(menu).toHaveClass('active')
  })

  it('closes menu on second click', () => {
    const { container } = render(
      <Dropdown>
        <DropdownToggle>Toggle</DropdownToggle>
        <DropdownMenu>Menu content</DropdownMenu>
      </Dropdown>
    )
    
    const toggle = screen.getByText('Toggle')
    fireEvent.click(toggle)
    fireEvent.click(toggle)
    
    const menu = container.querySelector('.dropdown__menu')
    expect(menu).not.toHaveClass('active')
  })

  it('opens menu on Enter key', () => {
    const { container } = render(
      <Dropdown>
        <DropdownToggle>Toggle</DropdownToggle>
        <DropdownMenu>Menu</DropdownMenu>
      </Dropdown>
    )
    
    const toggle = screen.getByRole('button')
    fireEvent.keyDown(toggle, { key: 'Enter' })
    
    const menu = container.querySelector('.dropdown__menu')
    expect(menu).toHaveClass('active')
  })

  it('opens menu on Space key', () => {
    const { container } = render(
      <Dropdown>
        <DropdownToggle>Toggle</DropdownToggle>
        <DropdownMenu>Menu</DropdownMenu>
      </Dropdown>
    )
    
    const toggle = screen.getByRole('button')
    fireEvent.keyDown(toggle, { key: ' ' })
    
    const menu = container.querySelector('.dropdown__menu')
    expect(menu).toHaveClass('active')
  })
})

describe('DropdownMenu Component', () => {
  it('renders menu content', () => {
    render(
      <Dropdown>
        <DropdownMenu>Menu items</DropdownMenu>
      </Dropdown>
    )
    expect(screen.getByText('Menu items')).toBeInTheDocument()
  })

  it('throws error when DropdownMenu is used outside Dropdown', () => {
    expect(() => render(<DropdownMenu>Menu</DropdownMenu>)).toThrow(
      'Dropdown subcomponents must be used within <Dropdown>'
    )
  })

  it('does not have active class initially', () => {
    const { container } = render(
      <Dropdown>
        <DropdownMenu>Menu</DropdownMenu>
      </Dropdown>
    )
    const menu = container.querySelector('.dropdown__menu')
    expect(menu).not.toHaveClass('active')
  })
})

describe('DropdownItem Component', () => {
  it('renders item as link', () => {
    render(
      <Dropdown>
        <DropdownMenu>
          <DropdownItem href="/test">Item</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    )
    const item = screen.getByText('Item')
    expect(item.tagName).toBe('A')
    expect(item).toHaveAttribute('href', '/test')
  })

  it('calls onClick handler', () => {
    const handleClick = vi.fn()
    render(
      <Dropdown>
        <DropdownMenu>
          <DropdownItem onClick={handleClick}>Item</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    )

    
    fireEvent.click(screen.getByText('Item'))
    expect(handleClick).toHaveBeenCalled()
  })

  it('throws error when DropdownItem is used outside Dropdown', () => {
    expect(() => render(<DropdownItem>Item</DropdownItem>)).toThrow(
      'Dropdown subcomponents must be used within <Dropdown>'
    )
  })

  it('closes menu after click', () => {
    const { container } = render(
      <Dropdown>
        <DropdownToggle>Toggle</DropdownToggle>
        <DropdownMenu>
          <DropdownItem>Item</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    )
    
    // Open menu
    fireEvent.click(screen.getByText('Toggle'))
    let menu = container.querySelector('.dropdown__menu')
    expect(menu).toHaveClass('active')
    
    // Click item
    fireEvent.click(screen.getByText('Item'))
    menu = container.querySelector('.dropdown__menu')
    expect(menu).not.toHaveClass('active')
  })
})