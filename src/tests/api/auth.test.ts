import { describe, it, expect, vi, beforeEach } from 'vitest';
import { register, login, refresh, type LoginResponse } from '../../api/auth';

//  mock setup 
const mockFetch = vi.fn();
globalThis.fetch = mockFetch as unknown as typeof fetch;

function createResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: async () => body,
  } as Response;
}

beforeEach(() => {
  mockFetch.mockReset();
});


describe('register', () => {
  const validUser = {
    login: 'test@example.com',
    password: 'secret',
    first_name: 'John',
    last_name: 'Doe',
    is_manager: false,
  };

  it('should call fetch with correct parameters and return the parsed JSON on success', async () => {
    const fakeResponse = { id: 1, message: 'created' };
    mockFetch.mockResolvedValueOnce(createResponse(fakeResponse, true));

    const result = await register(validUser);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('/auth/register');
    expect(options.method).toBe('POST');
    expect(options.credentials).toBe('include');
    expect(options.headers).toEqual({
      'Content-Type': 'application/json',
      'accept': 'application/json',
    });
    expect(options.body).toBe(JSON.stringify(validUser));
    expect(result).toEqual(fakeResponse);
  });

  it('should throw an error containing the server detail when the response is not ok', async () => {
    const errorBody = { detail: 'Email already taken' };
    mockFetch.mockResolvedValueOnce(createResponse(errorBody, false, 400));

    await expect(register(validUser)).rejects.toThrow('Email already taken');
  });

  it('should throw a default error message if the server does not provide detail', async () => {
    mockFetch.mockResolvedValueOnce(createResponse({}, false, 500));

    await expect(register(validUser)).rejects.toThrow('Ошибка регистрации');
  });
});

describe('login', () => {
  const loginName = 'e.resetto291@gmail.com';
  const password_str = 'password123';

  const expectedBody = new URLSearchParams();
  expectedBody.append('grant_type', '');
  expectedBody.append('username', loginName);
  expectedBody.append('password', password_str);
  expectedBody.append('scope', '');
  expectedBody.append('client_id', '');
  expectedBody.append('client_secret', '');

  it('should call fetch with x-www-form-urlencoded body and return LoginResponse on success', async () => {
    const fakeToken: LoginResponse = {
      access_token: 'abc.def.ghi',
      token_type: 'bearer',
      first_name: 'Иван',
      last_name: 'Петров',
      is_manager: false,
    };
    mockFetch.mockResolvedValueOnce(createResponse(fakeToken, true));

    const result = await login(loginName, password_str);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('/auth/login');
    expect(options.method).toBe('POST');
    expect(options.credentials).toBe('include');
    expect(options.headers).toEqual({
      'Content-Type': 'application/x-www-form-urlencoded',
      'accept': 'application/json',
    });
    expect(options.body.toString()).toBe(expectedBody.toString());
    expect(result).toEqual(fakeToken);
  });

  it('should throw an error with server detail on failed login', async () => {
    mockFetch.mockResolvedValueOnce(
      createResponse({ detail: 'Invalid credentials' }, false, 401)
    );
    await expect(login(loginName, password_str)).rejects.toThrow('Invalid credentials');
  });

  it('should throw a default error if server returns no detail', async () => {
    mockFetch.mockResolvedValueOnce(createResponse({}, false, 500));
    await expect(login(loginName, password_str)).rejects.toThrow('Ошибка входа');
  });
});

describe('refresh', () => {
  it('should call /auth/refresh with credentials include and return the parsed LoginResponse', async () => {
    const fakeToken: LoginResponse = {
      access_token: 'fresh.token.here',
      is_manager: true,
    };
    mockFetch.mockResolvedValueOnce(createResponse(fakeToken, true));

    const result = await refresh();

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('/auth/refresh');
    expect(options.method).toBe('POST');
    expect(options.credentials).toBe('include');
    expect(options.headers).toEqual({ accept: 'application/json' });
    expect(result).toEqual(fakeToken);
  });

  it('should throw an error with server detail when refresh fails', async () => {
    mockFetch.mockResolvedValueOnce(
      createResponse({ detail: 'Session expired' }, false, 401)
    );
    await expect(refresh()).rejects.toThrow('Session expired');
  });

  it('should throw a default error if server error has no detail', async () => {
    mockFetch.mockResolvedValueOnce(createResponse({}, false, 500));
    await expect(refresh()).rejects.toThrow('Не удалось обновить сессию');
  });

  it('should throw if the response is successful but access_token is missing', async () => {
    const emptyToken = { is_manager: true }; // no access_token
    mockFetch.mockResolvedValueOnce(createResponse(emptyToken, true));

    await expect(refresh()).rejects.toThrow('Сервер вернул пустой токен');
  });
});