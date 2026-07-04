# Backend FloppaSite на FastAPI

## Структура проекта

```
backend/
├── app/
│   ├── api/              # API маршруты
│   │       └── router.py
│   ├── core/             # Основные конфигурации
│   │   ├── config.py     # Настройки приложения
│   │   └── database.py   # БД конфигурация
│   ├── models/           # SQLAlchemy модели
│   ├── schemas/          # Pydantic схемы
│   └── services/         # Бизнес-логика
├── main.py               # Точка входа
├── requirements.txt      
├── .env.example          # Пример переменных окружения
├── .gitignore
└── Dockerfile
```

## Установка

### 1. Клонируйте репозиторий
```bash
cd backend
```

### 2. Создайте виртуальное окружение
```bash
python -m venv venv
source venv/bin/activate  # На Windows: venv\Scripts\activate
```

### 3. Установите зависимости
```bash
pip install -r requirements.txt
```

### 4. Создайте .env файл
```bash
cp .env.example .env
```

### 5. Запустите приложение
```bash
python main.py
```

Приложение будет доступно по адресу: `http://localhost:8000`

## Доступные endpoints

- **GET /health** - Проверка здоровья приложения
- **GET /api/v1/** - Проверка API v1
- **GET /docs** - Swagger UI документация
- **GET /redoc** - ReDoc документация

## Развертывание с Docker

```bash
docker build -t floppasit-backend .
docker run -p 8000:8000 --env-file .env floppasit-backend
```

## Добавление новых маршрутов

1. Создайте файл в `app/api/v1/endpoints/`
2. Определите router и маршруты
3. Включите router в `app/api/v1/router.py`:

```python
from app.api.v1.endpoints import users
router.include_router(users.router, prefix="/users", tags=["users"])
```

## Добавление новых моделей

1. Создайте файл в `app/models/`
2. Определите модель, наследуя `Base`
3. Импортируйте в `app/models/__init__.py`

## Структура слоев

- **API Layer** (`app/api/`) - Обработка HTTP запросов
- **Schema Layer** (`app/schemas/`) - Валидация данных Pydantic
- **Service Layer** (`app/services/`) - Бизнес-логика
- **Model Layer** (`app/models/`) - Работа с БД через SQLAlchemy
- **Core Layer** (`app/core/`) - Конфигурация и база
