import { useEffect, useRef, useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { isFullUser } from '../types/auth'
import styles from './MainLayout.module.css'

export function MainLayout() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const displayName = user && isFullUser(user)
    ? `${user.last_name} ${user.first_name?.charAt(0)}.`
    : user?.login

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
    navigate('/')
  }

  return (
    <div className={styles.mainLayout}>
      <header className={styles.header}>
        <Link to="/" className={styles.brand}>
          RPPR Hotels
        </Link>
        <nav className={styles.nav}>
          {isAuthenticated ? (
            <div className={styles.userMenu} ref={menuRef}>
              <button
                className={styles.userNameButton}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                {displayName} ▾
              </button>

              {userMenuOpen && (
                <div className={styles.dropdown}>
                  <Link
                    to="/profile/bookings"
                    className={styles.dropdownItem}
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Мои бронирования
                  </Link>

                  {user?.is_manager && (
                    <>
                      <Link
                        to="/admin"
                        className={styles.dropdownItem}
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Панель администратора
                      </Link>
                    </>
                  )}

                  <hr className={styles.dropdownDivider} />
                  <button
                    className={styles.dropdownItem}
                    onClick={handleLogout}
                  >
                    Выйти
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className={styles.navLink}>Вход</Link>
              <Link to="/register" className={styles.navLink}>Регистрация</Link>
            </>
          )}
        </nav>
      </header>

      <hr className={styles.separator} />
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  )
}
