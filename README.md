# AI Media Processing Platform

A production-style backend for asynchronous AI media processing with a simple React frontend. Built with Django + Django REST Framework, Celery + Redis for background processing, PostgreSQL for persistence, and a pluggable LLM provider layer (Groq by default). The system accepts user tasks (summarize, translate, enhance, tag, email), processes them asynchronously, and returns structured results to the frontend.

---

## Quick Links

- Backend: `backend/`
- Frontend: `frontend/`
- Celery tasks: `backend/tasks_app/`
- Env samples: `backend/.env.sample`

---

## Features

- JWT authentication (djangorestframework-simplejwt)
- Async task processing with Celery + Redis
- Pluggable AI client layer (`tasks_app/ai/`) for provider swaps
- Structured outputs: `summary`, `translation`, `email`, `tags`, `enhanced_text`
- Robust logging and fallbacks to avoid worker crashes
- Simple React frontend with a chat-like Home view and Task Status page

---

## API Endpoints

- **POST** `/api/tasks/create/` : Create a new AI task (POST-only). Use multipart/form-data for uploads or text fields. Returns `201` with the created task `id` (UUID) and initial `status`.

	Example (create a summarize task):

	```bash
	curl -X POST \
		-H "Authorization: Bearer <JWT_TOKEN>" \
		-F "task_type=summarize" \
		-F "input_text=Long article text..." \
		https://localhost:8000/api/tasks/create/
	```

- **GET** `/api/tasks/{task_id}/` : Retrieve task status and result. Returns `200` with JSON containing `status` and `result` (structured JSON with `output`, `summary`, `translation`, `email`, `tags`, etc.).

	Example (check status/result):

	```bash
	curl -H "Authorization: Bearer <JWT_TOKEN>" \
		https://localhost:8000/api/tasks/<TASK_UUID>/
	```

Note: The create endpoint enforces POST; the Task retrieval endpoint uses GET.


## Architecture (high level)

1. Client (React) sends task request → Django REST API
2. API validates and persists a `AITask` record (status = `PENDING`)
3. API enqueues a Celery task (`process_ai_task`) with the task id
4. Celery worker calls the pluggable LLM client in `tasks_app/ai/`
5. Worker saves structured result to DB and updates task `status`
6. Frontend polls the Task Status endpoint or uses chat UI polling to show results

### Diagram (add images here)

Add the frontend architecture image in the diagram area. Recommended filenames/paths:

- System architecture: `docs/images/architecture.png`
- Frontend diagram: `docs/images/frontend_architecture.png`

Place your frontend image at the second path above and it will appear below the main architecture diagram.

![Architecture Diagram - placeholder](docs/images/architecture.png)

![Frontend Diagram - placeholder](docs/images/frontend_architecture.png)

---

## Folder structure

```
INTERNSHIP/
├─ backend/                  # Django project
│  ├─ config/                # Django settings, URLs, celery app
│  ├─ accounts/              # user model, auth endpoints
│  ├─ tasks_app/             # models, serializers, views, tasks, services, ai clients
│  │  ├─ ai/                 # pluggable AI provider modules (groq_client.py, summarizer.py...)
│  │  ├─ tasks.py            # celery task entrypoint
│  │  ├─ services.py         # orchestrates feature modules
│  │  └─ ...
│  ├─ requirements.txt
│  └─ .env.sample
├─ frontend/                 # React + Vite frontend
│  ├─ src/
│  │  ├─ pages/              # Home, TaskStatus, Login, Register
│  │  └─ api.js              # axios wrapper & API helpers
│  └─ package.json
└─ README.md
```

---

## Installation (local development)

Prerequisites:

- Python 3.10+ (or compatible)
- Node 18+ / npm or yarn
- PostgreSQL
- Redis

Backend (API + Celery)

```bash
# from project root
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# copy .env.sample to .env and populate values
cp .env.sample .env
# edit .env and set POSTGRES, REDIS and GROQ_API_KEY

# create DB and run migrations
python manage.py migrate

# create superuser (optional)
python manage.py createsuperuser

# run celery worker (in another terminal)
# ensure redis server is running
celery -A config worker --loglevel=info

# run Django dev server
python manage.py runserver
```

Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Environment variables

Fill in `backend/.env` (example fields):

- `SECRET_KEY` — Django secret
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, `POSTGRES_PORT`
- `REDIS_URL` — e.g. `redis://localhost:6379/0`
- `GROQ_API_KEY`, `GROQ_MODEL`, `GROQ_API_URL`
- `DEBUG` — `True` for local development

---

## PostgreSQL: manual setup (optional)

The Django app manages schema via migrations (recommended). If you need to create the database and table manually (for example, for quick testing or debugging), here are example commands. Replace names/credentials to match your environment.

```bash
# create DB and user (run as linux user with postgres access)
sudo -u postgres psql -c "CREATE DATABASE ai_media;"
sudo -u postgres psql -c "CREATE USER ai_user WITH PASSWORD 'securepassword';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ai_media TO ai_user;"

# enable UUID generation extension inside the DB
sudo -u postgres psql -d ai_media -c 'CREATE EXTENSION IF NOT EXISTS "pgcrypto";'

# Example table matching the Django `AITask` model (Django migrations are preferred):
sudo -u postgres psql -d ai_media -c "\
CREATE TABLE IF NOT EXISTS tasks_app_aitask (\
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\
	user_id INTEGER REFERENCES auth_user(id),\
	task_type VARCHAR(64) NOT NULL,\
	input_text TEXT,\
	status VARCHAR(32) NOT NULL DEFAULT 'PENDING',\
	result JSONB,\
	celery_id VARCHAR(128),\
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),\
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()\
);"
```

Notes:
- Using raw SQL is optional — prefer `python manage.py migrate` to ensure Django and app migrations remain the source of truth.
- If you create tables manually, ensure permissions and extensions (`pgcrypto` or `uuid-ossp`) are available.


## Running & Testing

- Start PostgreSQL and Redis locally
- Apply migrations: `python manage.py migrate`
- Start Celery worker: `celery -A config worker --loglevel=info`
- Start Django server: `python manage.py runserver`
- Start frontend: `cd frontend && npm run dev`

Use the frontend UI to register/login and submit tasks. Task status and results are available in the Task Status page.

---

## Troubleshooting

- Celery worker logs: check `celery` terminal for exceptions and API errors.
- Make sure `GROQ_API_KEY` (or your chosen provider key) is valid and has required permissions.
- If tasks return empty results, check `tasks_app/ai/groq_client.py` logs and the provider response shape.

---

## Next improvements

- Add WebSocket/SSE push for real-time updates (replace polling)
- E2E tests for each task type and provider
- Add a production-ready deployment guide (Gunicorn, Nginx, systemd for Celery)

---

## Contributing

1. Fork repository
2. Create a feature branch
3. Open a PR with a clear description and tests

---

## Contact

See `EXplanation.md` for more detailed debugging notes and history.

---

_Generated: 2026-05-27_
# AI Media Processing Backend

Django + DRF backend with Celery/Redis for async AI tasks and Groq integration.

Key endpoints:

- `POST /api/register` - register user
- `POST /api/login` - obtain JWT
- `POST /api/tasks/create` - create AI task
- `GET /api/tasks/` - list user's tasks
- `GET /api/tasks/<id>/status` - task status
- `GET /api/tasks/<id>/result` - task result
- `POST /api/tasks/<id>/retry` - retry failed task

See `.env.sample` for environment variables.
