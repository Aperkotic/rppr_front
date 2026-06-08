import React, { useState, useContext } from 'react';
import styles from './AuthPage.module.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext, AuthContextValue } from '../../contexts/AuthContext';

interface AuthPageProps {
  initialIsLogin: boolean;
}

const validateEmail = (email: string) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

const getAuthErrorMessage = (message?: string) => {
  if (message === 'Login already exists') {
    return 'Пользователь с таким email уже существует';
  }
  return message || 'Произошла неизвестная ошибка';
};

const AuthPage: React.FC<AuthPageProps> = ({ initialIsLogin }) => {
  const isLogin = initialIsLogin;
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const auth = useContext(AuthContext) as AuthContextValue;
  const location = useLocation();
  const navigate = useNavigate();

  const formKey = `${isLogin}-${location.pathname}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    if (!formData.email || !formData.password) {
      return 'Email и пароль обязательны для заполнения';
    }
    if (!validateEmail(formData.email)) {
      return 'Некорректный формат email';
    }
    if (formData.password.length < 6) {
      return 'Пароль должен содержать не менее 6 символов';
    }
    if (!isLogin) {
      if (!formData.firstName || !formData.lastName) {
        return 'Имя и фамилия обязательны для заполнения';
      }
      if (formData.password !== formData.confirmPassword) {
        return 'Пароли не совпадают';
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await auth.login(formData.email, formData.password);
        navigate('/');
      } else {
        await auth.register({
          login: formData.email,
          password: formData.password,
          first_name: formData.firstName,
          last_name: formData.lastName,
          is_manager: false,
        });
        navigate('/');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : undefined;
      setError(getAuthErrorMessage(message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <Link to="/" className={styles.closeLink} aria-label="Вернуться на главную страницу" />

        <h2 className={styles.title}>{isLogin ? 'Авторизация' : 'Регистрация'}</h2>

        <form key={formKey} className={styles.authForm} onSubmit={handleSubmit} noValidate>
          <div className={styles.inputGroup}>
            <input
              className={styles.inputField}
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {!isLogin && (
            <>
              <div className={styles.inputGroup}>
                <input
                  className={styles.inputField}
                  type="text"
                  name="firstName"
                  placeholder="Имя"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.inputGroup}>
                <input
                  className={styles.inputField}
                  type="text"
                  name="lastName"
                  placeholder="Фамилия"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          <div className={styles.inputGroup}>
            <input
              className={styles.inputField}
              type="password"
              name="password"
              placeholder="Пароль"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          {!isLogin && (
            <div className={styles.inputGroup}>
              <input
                className={styles.inputField}
                type="password"
                name="confirmPassword"
                placeholder="Повторите пароль"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          )}

          <p
            className={styles.errorContainer}
            role={error ? 'alert' : undefined}
            aria-live="polite"
          >
            {error}
          </p>

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
          </button>
        </form>

        <p className={styles.switchLink}>
          {isLogin ? 'Нет аккаунта? ' : 'Есть аккаунт? '}
          <Link to={isLogin ? '/register' : '/login'}>
            {isLogin ? 'Зарегистрироваться' : 'Войти'}
          </Link>
        </p>

      </div>
    </div>
  );
};

export default AuthPage;