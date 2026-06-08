import {
  createContext,
  useContext,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react'
import { cn } from '../utils/cn'

interface NavbarContextValue {
  menuOpen: boolean
  setMenuOpen: (open: boolean) => void
}

const NavbarContext = createContext<NavbarContextValue | null>(null)

function useNavbarContext() {
  const ctx = useContext(NavbarContext)
  if (!ctx) {
    throw new Error('Navbar subcomponents must be used within <Navbar>')
  }
  return ctx
}

export interface NavbarProps {
  className?: string
  children?: ReactNode
}

export function Navbar({ className, children }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <NavbarContext.Provider value={{ menuOpen, setMenuOpen }}>
      <nav className={cn('navbar', className)}>{children}</nav>
    </NavbarContext.Provider>
  )
}

export function NavbarContainer({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) {
  return <div className={cn('navbar__container', className)} {...props} />
}

export function NavbarBrand({
  className,
  ...props
}: ComponentPropsWithoutRef<'a'>) {
  return <a className={cn('navbar__brand', className)} {...props} />
}

export function NavbarMenu({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) {
  const { menuOpen } = useNavbarContext()

  return (
    <div
      className={cn('navbar__menu', menuOpen && 'active', className)}
      {...props}
    />
  )
}

export function NavbarItem({
  className,
  ...props
}: ComponentPropsWithoutRef<'a'>) {
  return <a className={cn('navbar__item', className)} {...props} />
}

export function NavbarToggle({ className }: { className?: string }) {
  const { menuOpen, setMenuOpen } = useNavbarContext()

  return (
    <button
      type="button"
      className={cn('navbar__toggle', className)}
      aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
      aria-expanded={menuOpen}
      style={{ background: 'none', border: 'none', padding: 0 }}
      onClick={() => setMenuOpen(!menuOpen)}
    >
      <span />
      <span />
      <span />
    </button>
  )
}