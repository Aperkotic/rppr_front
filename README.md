# RPPR Front — бронирование отелей

Фронтенд системы бронирования отелей. Работает с API бэкенда [hotel_booking](https://github.com/Djankoq/hotel_booking) (FastAPI).

## Стек технологий

| Категория | Технология |
|-----------|------------|
| Язык | TypeScript |
| UI | React 19 |
| Сборка | Vite 8 |
| Маршрутизация | React Router |
| HTTP-клиент | Axios |
| Выбор даты | [react-datepicker](https://reactdatepicker.com/) + [date-fns](https://date-fns.org/) (русская локаль) |
| Стили | SCSS (UI-kit на BEM-классах) |
| Контейнеризация | Docker |
| Веб-сервер (production) | Nginx |

## Возможности

- Регистрация и вход (`/register`, `/login`)
- JWT access token + refresh token в httpOnly cookie
- UI-kit: кнопки, поля ввода, карточки, навбар и др.
- Проксирование API в dev (Vite) и в production (Nginx)
- Фильтры на главной: поля «Дата начала» и «Дата окончания» открывают календарь по клику (`react-datepicker`), подсказка при наведении — через `title`
- Автодополнение локации в фильтре: `GET /hotels/locations/suggest?q=...` (debounce 300 ms)

## Требования

- [Node.js](https://nodejs.org/) 20+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — для запуска в контейнере
- Запущенный бэкенд на порту **8000** (отдельный репозиторий `hotel_booking`)

## Локальная разработка

1. Установите зависимости:

```bash
npm install
```

2. Запустите API бэкенда (в каталоге `hotel_booking`):

```bash
docker compose up --build
```

Документация API: [http://localhost:8000/docs](http://localhost:8000/docs)

3. Запустите фронтенд:

```bash
npm run dev
```

Приложение: [http://localhost:5173](http://localhost:5173)

Запросы к `/auth`, `/hotels`, `/bookings`, `/admin`, `/room` проксируются на `http://localhost:8000` (см. [vite.config.js](vite.config.js)).

### Другие команды

```bash
npm run build    # проверка TypeScript + production-сборка в dist/
npm run preview  # просмотр собранного dist/
npm run lint     # ESLint
```

## Запуск через Docker

Фронтенд собирается в образ с Nginx: статика из `dist/` и прокси API на хост, где работает бэкенд.

1. Убедитесь, что бэкенд доступен на **http://localhost:8000** (запустите `docker compose` в `hotel_booking`).

2. В каталоге фронтенда:

```bash
docker compose up --build
```

3. Откройте [http://localhost:8080](http://localhost:8080)

Nginx проксирует пути `/auth`, `/hotels`, `/bookings`, `/admin`, `/room` на `host.docker.internal:8000` (настройка в [nginx.conf](nginx.conf)).

Остановка:

```bash
docker compose down
```

## Переменные окружения

В dev API вызывается через относительные URL и proxy; отдельный `.env` не обязателен. Пример — [.env.example](.env.example).

## Структура проекта

```
src/
  api/              # axios, auth API
  components/       # ui-kit, ProtectedRoute
  contexts/         # AuthContext
  hooks/
  layouts/          # MainLayout
  pages/            # Login, Register, Home
  types/
  utils/
```

## Авторизация

- **Регистрация:** `POST /auth/register` (JSON: имя, фамилия, логин, пароль).
- **Вход:** `POST /auth/login` (form: `username`, `password`).
- **Обновление токена:** `POST /auth/refresh` (cookie `refresh_token`).

После входа без предшествующей регистрации в этом браузере в профиле сохраняются только `login` и `id` из JWT; флаг `is_manager` приходит полностью только после регистрации.

## Связанный бэкенд

Репозиторий API: `hotel_booking` (FastAPI, PostgreSQL, Docker).

Для наполнения тестовыми данными (в контейнере бэкенда):

```bash
docker exec -it hotel_app_container python -m scripts.seed
```
