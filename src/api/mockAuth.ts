// Mock-данные для авторизации, если бэкенд недоступен
interface MockUser {
  login: string;
  password: string;
  first_name: string;
  last_name: string;
  is_manager: boolean;
}

const MOCK_USERS: MockUser[] = [
  {
    login: 'e.resetto291@gmail.com',
    password: 'password123',
    first_name: 'Иван',
    last_name: 'Петров',
    is_manager: false,
  },
  {
    login: 'admin@example.com',
    password: 'admin123',
    first_name: 'Админ',
    last_name: 'Системов',
    is_manager: true,
  },
];

// Утилита для корректного кодирования UTF-8 в Base64 (для JWT с кириллицей)
const utf8ToBase64 = (str: string): string => {
  return btoa(
    new Uint8Array(new TextEncoder().encode(str))
      .reduce((data, byte) => data + String.fromCharCode(byte), '')
  );
};

// Генерация mock JWT-токена
const generateMockToken = (user: MockUser): string => {
  const header = utf8ToBase64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = utf8ToBase64(JSON.stringify({ 
    user_id: MOCK_USERS.indexOf(user) + 1,
    login: user.login,
    first_name: user.first_name,
    last_name: user.last_name,
    is_manager: user.is_manager,
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 час
  }));
  const signature = utf8ToBase64('mock-signature');
  return `${header}.${payload}.${signature}`;
};

export const mockLogin = async (login: string, password: string) => {
  // Имитация задержки сети
  await new Promise(resolve => setTimeout(resolve, 500));

  const user = MOCK_USERS.find(u => u.login === login && u.password === password);
  
  if (!user) {
    throw new Error('Неверный email или пароль');
  }

  const access_token = generateMockToken(user);

  return {
    access_token,
    first_name: user.first_name,
    last_name: user.last_name,
    is_manager: user.is_manager,
  };
};

export const mockRegister = async (data: {
  login: string;
  password: string;
  first_name: string;
  last_name: string;
}) => {
  await new Promise(resolve => setTimeout(resolve, 500));

  // Проверка, что логин не занят
  if (MOCK_USERS.find(u => u.login === data.login)) {
    throw new Error('Login already exists');
  }

  // Добавляем нового пользователя
  const newUser: MockUser = {
    login: data.login,
    password: data.password,
    first_name: data.first_name,
    last_name: data.last_name,
    is_manager: false,
  };
  
  MOCK_USERS.push(newUser);

  return {
    id: MOCK_USERS.length,
    login: data.login,
    first_name: data.first_name,
    last_name: data.last_name,
    is_manager: false,
  };
};