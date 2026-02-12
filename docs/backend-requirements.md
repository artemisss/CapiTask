# Backend Requirements for Capitask

## 1. Цель backend

Backend должен обеспечивать надёжную и безопасную серверную часть для `Capitask`:

- хранение задач, спринтов, проектов, пользователей и комментариев;
- авторизацию и контроль доступа;
- API для web-клиента и будущих интеграций;
- аудит действий и наблюдаемость.

## 2. Минимальный функциональный scope (MVP)

Нужно реализовать:

- аутентификацию пользователей;
- управление рабочими пространствами (workspace) и проектами;
- CRUD для задач;
- смену статуса задач и работу со спринтом;
- комментарии к задачам;
- фильтрацию/поиск задач;
- базовый аудит действий (кто и когда изменил задачу).

## 3. Предлагаемый стек

Допустимые варианты (выбрать один в рамках первой версии):

- `Node.js + TypeScript + Fastify/NestJS + PostgreSQL`
- `Python + FastAPI + PostgreSQL`

Дополнительно:

- `Redis` для кеша и rate limit;
- `S3-совместимое` хранилище для вложений;
- `OpenAPI` как контракт API.

## 4. Доменные сущности

Минимальные сущности:

- `User`: id, email, password_hash, display_name, is_active, created_at, updated_at.
- `Workspace`: id, name, slug, created_at, updated_at.
- `WorkspaceMember`: workspace_id, user_id, role (`owner`, `admin`, `member`, `viewer`).
- `Project`: id, workspace_id, key, name, description, is_archived.
- `Sprint`: id, project_id, name, goal, start_date, end_date, is_active.
- `Issue`: id, project_id, sprint_id, key, title, description, type, priority, status, assignee_id, reporter_id, story_points, due_date.
- `IssueComment`: id, issue_id, author_id, body, created_at, updated_at.
- `IssueHistory`: id, issue_id, actor_id, field, old_value, new_value, created_at.

## 5. API (MVP)

Базовые группы endpoint:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/me`

- `GET /api/v1/workspaces`
- `POST /api/v1/workspaces`
- `GET /api/v1/workspaces/{workspaceId}/projects`
- `POST /api/v1/workspaces/{workspaceId}/projects`

- `GET /api/v1/projects/{projectId}/issues`
- `POST /api/v1/projects/{projectId}/issues`
- `GET /api/v1/issues/{issueId}`
- `PATCH /api/v1/issues/{issueId}`
- `DELETE /api/v1/issues/{issueId}`

- `GET /api/v1/projects/{projectId}/sprints`
- `POST /api/v1/projects/{projectId}/sprints`
- `PATCH /api/v1/sprints/{sprintId}`

- `GET /api/v1/issues/{issueId}/comments`
- `POST /api/v1/issues/{issueId}/comments`
- `PATCH /api/v1/comments/{commentId}`
- `DELETE /api/v1/comments/{commentId}`

Требования к API:

- все ответы в JSON;
- корректные HTTP-коды;
- пагинация на списках (`limit/offset` или `cursor`);
- фильтры (status, assignee, priority, sprint, search);
- единый формат ошибок.

## 6. Аутентификация и авторизация

- `JWT access + refresh tokens` или server-side session.
- Обязательная проверка доступа к workspace/project/issue на каждом endpoint.
- Роли минимум: `owner`, `admin`, `member`, `viewer`.
- Политики доступа:
  - `viewer`: чтение;
  - `member`: чтение + изменение задач;
  - `admin/owner`: управление проектом и участниками.

## 7. Безопасность (обязательно)

- Пароли хранить только как `argon2id`/`bcrypt` хэши.
- Защититься от `SQL Injection` через параметризованные запросы/ORM.
- Валидация входных DTO (длина, формат, enum, даты).
- Санитизация пользовательского текста (описания, комментарии).
- `Rate limit` на auth и публичные endpoint.
- Защита от brute-force и credential stuffing.
- CORS только для доверенных origin.
- Не возвращать внутренние stack traces в production.
- Аудит security-событий: логин, logout, смена ролей, ошибки доступа.

## 8. Нефункциональные требования

- Время ответа p95: до `300ms` для большинства GET на MVP-объёмах.
- Версионирование API: префикс `/api/v1`.
- Поддержка миграций БД (`up/down`).
- Health endpoints:
  - `GET /health/live`
  - `GET /health/ready`

## 9. Наблюдаемость

- Структурированные логи (`JSON`) с `request_id`.
- Метрики: RPS, latency, error rate, DB latency.
- Трассировка запросов (опционально OpenTelemetry).
- Алерты на рост 5xx и деградацию latency.

## 10. Тестирование

Минимум:

- unit-тесты для бизнес-логики;
- интеграционные тесты API;
- smoke-тесты auth и базовых CRUD-сценариев;
- отдельные тесты для проверок доступа (RBAC).

## 11. SQL-конвенции

- Поддержка PostgreSQL как primary DB.
- Для аналитики допускается ClickHouse (отдельно от transactional БД).
- SQL писать в верхнем регистре ключевых слов и с аккуратными отступами.

## 12. Definition of done для backend задач

Задача считается выполненной, если:

- реализован endpoint/логика;
- добавлены тесты;
- обновлён OpenAPI-контракт;
- обновлена документация при изменении поведения;
- выполнены security-проверки из раздела 7.
