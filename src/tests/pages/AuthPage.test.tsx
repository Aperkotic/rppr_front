import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AuthPage from '../../pages/Auth/AuthPage';
import { AuthContext, AuthContextValue } from '../../contexts/AuthContext';

// Mocks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/test' }),
  };
});

const mockLogin = vi.fn();
const mockRegister = vi.fn();

const makeAuthContext = (overrides?: Partial<AuthContextValue>): AuthContextValue => ({
  isAuthenticated: false,
  user: null,
  login: mockLogin,        
  register: mockRegister,  
  logout: vi.fn(),
  isLoading: false,
  ...overrides,
});

let authContext: ReturnType<typeof makeAuthContext>;

beforeEach(() => {
  vi.clearAllMocks();
  authContext = makeAuthContext();
  mockLogin.mockResolvedValue(undefined);
  mockRegister.mockResolvedValue(undefined);
});

describe('validateEmail', () => {
  it('shows error for invalid email format', async () => {
    render(
      <AuthContext.Provider value={authContext}>
        <MemoryRouter>
          <AuthPage initialIsLogin={true} />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'bad-email' } });
    fireEvent.change(screen.getByPlaceholderText('Пароль'), { target: { value: '123456' } });
    fireEvent.click(screen.getByText('Войти'));

    await waitFor(() => {
      expect(screen.getByText('Некорректный формат email')).toBeInTheDocument();
    });
  });

  it('accepts a valid email (no error for email format)', async () => {
    render(
      <AuthContext.Provider value={authContext}>
        <MemoryRouter>
          <AuthPage initialIsLogin={true} />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Пароль'), { target: { value: '123456' } });
    fireEvent.click(screen.getByText('Войти'));

    await waitFor(() => {
      expect(screen.queryByText('Некорректный формат email')).toBeNull();
    });
  });
});

describe('getAuthErrorMessage', () => {
  it('displays translated message for "Login already exists"', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Login already exists'));

    render(
      <AuthContext.Provider value={authContext}>
        <MemoryRouter>
          <AuthPage initialIsLogin={true} />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByPlaceholderText('Пароль'), { target: { value: '123456' } });
    fireEvent.click(screen.getByText('Войти'));

    await waitFor(() => {
      expect(
        screen.getByText('Пользователь с таким email уже существует')
      ).toBeInTheDocument();
    });
  });

  it('displays original error message for unknown errors', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Network error'));

    render(
      <AuthContext.Provider value={authContext}>
        <MemoryRouter>
          <AuthPage initialIsLogin={true} />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByPlaceholderText('Пароль'), { target: { value: '123456' } });
    fireEvent.click(screen.getByText('Войти'));

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('displays default fallback for undefined message', async () => {
    mockLogin.mockRejectedValueOnce({});

    render(
      <AuthContext.Provider value={authContext}>
        <MemoryRouter>
          <AuthPage initialIsLogin={true} />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByPlaceholderText('Пароль'), { target: { value: '123456' } });
    fireEvent.click(screen.getByText('Войти'));

    await waitFor(() => {
      expect(
        screen.getByText('Произошла неизвестная ошибка')
      ).toBeInTheDocument();
    });
  });
});