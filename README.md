# Cyberpunk RED Character Sheet

Полнофункциональный лист персонажа для настольной игры **Cyberpunk RED** на основе React + FastAPI.

## 📋 Содержание

- [О проекте](#о-проекте)
- [Функционал](#функционал)
- [Стек технологий](#стек-технологий)
- [Установка и запуск](#установка-и-запуск)
- [Структура проекта](#структура-проекта)
- [API документация](#api-документация)
- [База данных](#база-данных)
- [Архитектура](#архитектура)
- [Возможности](#возможности)
- [Разработка](#разработка)
- [Деплой](#деплой)

---

## 🎯 О проекте

Это веб-приложение для создания и управления листами персонажей Cyberpunk RED. Поддерживает полную синхронизацию данных с бэкендом, аутентификацию пользователей, и сохраняет все данные в базе данных.

### Основные возможности:
- 📝 Создание и управление персонажами
- 🎲 Броски кубиков и расчёты
- 🔐 Аутентификация пользователей
- 💾 Синхронизация с бэкендом
- 🌍 Интернационализация (RU/EN)
- 📱 Адаптивный дизайн
- 📤 Экспорт/импорт данных

---

## ✨ Функционал

### 🔐 Авторизация
- Регистрация с email и паролем
- Вход с JWT токеном
- Защита маршрутов (PrivateRoute)
- Выход из аккаунта
- Все персонажи привязаны к пользователю

### 👥 Characters (Управление персонажами)
- Создание/редактирование/удаление персонажей
- Синхронизация с бэкендом (автоматическое сохранение в БД)
- Просмотр списка персонажей
- Загрузка персонажа в Character Sheet
- Экспорт/импорт всех персонажей (JSON)

### 📋 Character Sheet (Лист персонажа)
- **ID Block**: имя, возраст, роль, XP, humanity
- **Stats**: INT, REF, DEX, TECH, COOL, WILL, LUCK, MOVE, BODY, EMP
- **Initiative**: автоматический расчёт и бросок кубика
- **Health**: HP, seriously wounded (-2 penalty), death save
- **Armor**: head/body/shield с SP и penalty
- **Skills**: 9 групп навыков с авто-расчётом BASE
- **Specialised Skills**: настраиваемые навыки
- **Weapons**: оружие с формулами урона
- **Injuries/Notes**: критические ранения, зависимости, заметки

### 🔧 Implants (Киберимпланты)
- 8 типов имплантов:
  - Fashionware
  - Neuralware
  - Cyberoptics
  - Cyberaudio
  - Internal
  - External
  - Limb
  - Borgware
- Визуальная схема тела с кликабельными зонами
- Карточки имплантов с эффектами, стоимостью, редкостью
- Подсчёт общей потери человечности
- **Lifepath**: культурные корни, личность, ценности, семья, друзья, враги
- **Inventory**: таблица снаряжения с весом и стоимостью

### 👹 Mobs (Противники)
- Создание групп противников
- Stats, health, armor
- Weapons с формулами урона и бросками
- Skills с presets
- Бросок инициативы

### 📝 Notes (Заметки)
- Текстовые заметки
- Таблицы (добавление строк/столбцов)
- Удаление строк/столбцов

### 💻 Scripts (Cyberdeck)
- Информация о дека: model, NET Actions, Black ICE
- Interface Abilities (checkboxes)
- Программы: Poor, Standard, Excellent, Cyberarm
- ATK/DEF формулы с бросками кубиков
- Hardware таблица
- Help dialog с правилами

### 🎲 Dice Roller (Броски кубиков)
- Типы: d4, d6, d8, d10, d12, d20
- Количество кубиков: 1-10
- Отображение результатов
- Критические успехи (10) и провалы (1)
- Поддержка формул (3d6 + 5)

---

## 🛠️ Стек технологий

### Frontend
- **React 19** — UI библиотека
- **Vite 6** — сборщик и dev сервер
- **React Router 7** — клиентская маршрутизация
- **Context API** — управление состоянием
- **Axios** — HTTP клиент
- **localStorage** — персистентность данных

### Backend
- **FastAPI 0.115** — веб-фреймворк
- **SQLAlchemy 2.0** — ORM
- **SQLite** — база данных
- **JWT** (python-jose) — аутентификация
- **Passlib** — хеширование паролей
- **Uvicorn** — ASGI сервер

---

## 🚀 Установка и запуск

### Предварительные требования
- Node.js 18+ и npm
- Python 3.9+ и pip
- Git (опционально)

### 1. Клонирование репозитория
```bash
git clone https://github.com/sizopu/react-sheet-red.git
cd react-sheet-red
```

### 2. Запуск Frontend (разработка)
```bash
# Установка зависимостей
npm install

# Запуск dev сервера
npm run dev
```

Frontend запустится на `http://localhost:3000`

### 3. Запуск Backend (разработка)
```bash
# Переход в директорию бэкенда
cd backend

# Создание виртуального окружения (опционально, но рекомендуется)
python -m venv venv

# Активация виртуального окружения
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Установка зависимостей
pip install -r requirements.txt

# Запуск FastAPI сервера
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend запустится на `http://localhost:8000`

### 4. Быстрый старт (оба сервера)

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

nohup /path/to/venv/bin/python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 > /tmp/uvicorn.log 2>&1 &
```

---

## 📁 Структура проекта

```
react-sheet-red/
├── backend/                        # FastAPI бэкенд
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # Главный файл FastAPI приложения
│   │   ├── database.py             # Подключение SQLite, создание таблиц
│   │   ├── models.py               # SQLAlchemy модели (User, Character)
│   │   ├── schemas.py              # Pydantic схемы валидации
│   │   ├── auth.py                 # JWT токены, хеширование паролей
│   │   ├── dependencies.py         # Зависимости (get_current_user)
│   │   └── routers/
│   │       ├── auth.py             # Роуты: /register, /login, /me
│   │       └── characters.py       # Роуты: CRUD персонажей
│   ├── venv/                       # Виртуальное окружение (не коммитится)
│   ├── cyberpunk.db                # SQLite база данных (автоматически создаётся)
│   └── requirements.txt            # Python зависимости
│
├── src/                            # React фронтенд
│   ├── components/                 # Переиспользуемые компоненты
│   │   ├── Layout.jsx              # Основная разметка (header, nav, footer)
│   │   ├── UserDialog.jsx          # Диалог пользователя (инфо + выход)
│   │   ├── AuthModal.jsx           # Модальное окно входа/регистрации
│   │   ├── DiceDialog.jsx          # Диалог броска кубиков
│   │   └── AvatarDialog.jsx        # Диалог выбора аватара
│   ├── pages/                      # Страницы приложения
│   │   ├── Characters.jsx          # Список персонажей, создание/удаление
│   │   ├── CharacterSheet.jsx      # Лист персонажа (основная страница)
│   │   ├── Implants.jsx            # Киберимпланты и lifepath
│   │   ├── Mobs.jsx                # Противники и группы
│   │   ├── Notes.jsx               # Заметки и таблицы
│   │   └── Scripts.jsx             # Cyberdeck
│   ├── context/                    # React Context
│   │   ├── AuthContext.jsx         # Состояние аутентификации
│   │   ├── CharacterContext.jsx    # Состояние персонажей + синхронизация
│   │   └── LanguageContext.jsx     # Переключение языка (RU/EN)
│   ├── services/
│   │   └── api.js                  # Axios клиент с JWT интерцептором
│   ├── i18n/
│   │   └── translations.js         # Переводы (RU/EN)
│   ├── css/                        # Стили
│   │   ├── main.css                # Общие стили
│   │   ├── character.css           # Лист персонажа
│   │   ├── implants.css            # Импланты
│   │   ├── mobs.css                # Противники
│   │   ├── notes.css               # Заметки
│   │   └── scripts.css             # Cyberdeck
│   ├── App.jsx                     # Корневой компонент с роутингом
│   └── main.jsx                    # Точка входа React
│
├── public/                         # Статические файлы
│   └── images/
│       ├── screenshot.png          # Схема тела для имплантов
│       ├── cyberpunk.png           # Логотип
│       └── Безымянный.png          # Дополнительное изображение
│
├── index.html                      # HTML шаблон
├── vite.config.js                  # Конфигурация Vite
├── package.json                    # Зависимости Node.js
└── README.md                       # Документация
```

---

## 📡 API документация

### Base URL
```
http://localhost:8000
```

### Swagger UI
```
http://localhost:8000/docs
```

### Auth Endpoints

#### Регистрация
```
POST /api/auth/register
{
  "username": "string",
  "email": "string",
  "password": "string"
}
→ { "message": "User created successfully" }
```

#### Вход
```
POST /api/auth/login
{
  "username": "string",
  "password": "string"
}
→ {
    "access_token": "jwt_token",
    "token_type": "bearer"
  }
```

#### Текущий пользователь
```
GET /api/auth/me (Authorization: Bearer <token>)
→ {
    "id": 1,
    "username": "string",
    "email": "string"
  }
```

### Character Endpoints

#### Получить всех персонажей
```
GET /api/characters (Authorization: Bearer <token>)
→ [{
    "id": 1,
    "name": "string",
    "data": {...},
    "owner_id": 1
  }]
```

#### Получить персонажа по ID
```
GET /api/characters/{id} (Authorization: Bearer <token>)
→ {
    "id": 1,
    "name": "string",
    "data": {...},
    "owner_id": 1
  }
```

#### Создать персонажа
```
POST /api/characters (Authorization: Bearer <token>)
{
  "name": "string",
  "data": {...}
}
→ {
    "id": 2,
    "name": "string",
    "data": {...},
    "owner_id": 1
  }
```

#### Обновить персонажа
```
PUT /api/characters/{id} (Authorization: Bearer <token>)
{
  "name": "string",
  "data": {...}
}
→ {
    "id": 1,
    "name": "string",
    "data": {...},
    "owner_id": 1
  }
```

#### Удалить персонажа
```
DELETE /api/characters/{id} (Authorization: Bearer <token>)
→ { "message": "Character deleted" }
```

---

## 💾 База данных

### Схема БД (SQLite)

#### Таблица `users`
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

#### Таблица `characters`
```sql
CREATE TABLE characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    data JSON NOT NULL,           -- Все данные персонажа в формате JSON
    owner_id INTEGER NOT NULL,    -- Ссылка на users.id
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
)
```

### Хранение данных

#### LocalStorage (Frontend)
- `token` — JWT токен аутентификации
- `currentCharacterId` — ID текущего выбранного персонажа
- `characters` — кэш списка персонажей
- `character_{id}_characterData` — полные данные персонажа
- `character_{id}_skillsData` — данные навыков
- `character_{id}_weaponsData` — данные оружия
- `character_{id}_rolesData` — данные ролей
- `character_{id}_specialisedSkillsData` — специализированные навыки
- `character_{id}_customSkillNames` — кастомные имена навыков
- `character_{id}_avatar` — аватар персонажа
- `mobs` — данные противников

#### Синхронизация
- При создании персонажа: сначала сохраняется локально, затем отправляется на бэкенд
- При изменении данных: авто-сохранение с debounce 1 секунда
- При загрузке страницы: проверка токена и загрузка персонажей с бэкенда

---

## 🏗️ Архитектура

### Frontend

```
┌─────────────────────────────────────────────────────────┐
│                         App.jsx                         │
│  (Router + PrivateRoute + LanguageContext Provider)     │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│ AuthContext   │  │ Character     │  │ Language      │
│               │  │ Context       │  │ Context       │
│ - token       │  │ - characters  │  │ - language    │
│ - user        │  │ - currentChar │  │ - t()         │
│ - login()     │  │   Data        │  │ - setLang()   │
│ - logout()    │  │ - addChar()   │  └───────────────┘
└───────────────┘  │ - deleteChar()│
                   │ - saveChar()  │
                   └───────────────┘
```

### Backend

```
┌─────────────────────────────────────────────────────────┐
│                    FastAPI App                          │
│  (CORS + AuthMiddleware + Database + Routers)           │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│ Auth Router   │  │ Characters    │  │ Dependencies  │
│ /register     │  │ Router        │  │               │
│ /login        │  │ /characters   │  │ get_current_  │
│ /me           │  │ /characters/{id}│ │ user()        │
└───────────────┘  └───────────────┘  └───────────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │  SQLAlchemy     │
                   │  + SQLite       │
                   └─────────────────┘
```

---

## 🎮 Возможности

### Character Sheet

#### ID Block
- Имя персонажа
- Возраст
- Роль (Solo, Rockerboy, Netrunner, Tech, и др.)
- XP (опыт)
- Humanity (человечность)

#### Stats (Атрибуты)
- INT (Интеллект)
- REF (Реакция)
- DEX (Ловкость)
- TECH (Техника)
- COOL (Хладнокровие)
- WILL (Сила воли)
- LUCK (Удача)
- MOVE (Ходьба)
- BODY (Тело)
- EMP (Эмпатия)

#### Combat
- Initiative (инициатива)
- HP (очки здоровья)
- Seriously wounded (-2 ко всем броскам)
- Death save (спасбросок от смерти)
- Critical injuries (критические ранения)
- Addictions (зависимости)

#### Armor (Броня)
- Head (голова)
- Body (тело)
- Shield (щит)
- SP (защита)
- Penalty (штраф)

#### Skills (Навыки)
9 групп навыков:
1. Awareness Skills
2. Body Skills
3. Control Skills
4. Education Skills
5. Fighting Skills
6. Performance Skills
7. Ranged Weapon Skills
8. Social Skills
9. Technique Skills

Каждый навык:
- Уровень (0-10)
- Модификатор
- BASE расчёт (атрибут + мод + уровень)

#### Specialised Skills
- Настраиваемые навыки
- Выбор атрибута
- Модификатор и уровень

#### Weapons (Оружие)
- Название
- Урон (формулы: 3d6+5)
- Магазин
- Меткость
- Примечания
- Несколько слотов атаки

### Implants

#### Lifepath
- Aliases (псевдонимы)
- Improvement Points
- Reputation (репутация)
- Cultural Origins
- Personality
- Clothing Styles
- Hairstyle
- Values
- Family Background
- Friends/Enemies/Tragic Love
- Housing/Lifestyle

#### Inventory
- Снаряжение
- Стоимость
- Вес
- Cash (деньги)

---

## 💻 Разработка

### Команды разработки

#### Frontend
```bash
# Установка зависимостей
npm install

# Запуск dev сервера (hot reload)
npm run dev

# Сборка для продакшена
npm run build

# Предпросмотр продакшен сборки
npm run preview

# Деплой на GitHub Pages
npm run deploy
```

#### Backend
```bash
# Создание виртуального окружения
python -m venv venv

# Активация (Linux/Mac)
source venv/bin/activate

# Активация (Windows)
venv\Scripts\activate

# Установка зависимостей
pip install -r requirements.txt

# Запуск с автоперезагрузкой
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Запуск без автоперезагрузкой (продакшен)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Переменные окружения

#### Backend (опционально)
Создайте файл `backend/.env`:
```env
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
DATABASE_URL=sqlite:///./cyberpunk.db
```

---

## 🌐 Деплой

### Frontend (GitHub Pages)
```bash
# Настройка репозитория
npm install --save-dev gh-pages

# Изменение package.json:
# "homepage": "https://sizopu.github.io/react-sheet-red"
# "scripts": {
#   "predeploy": "npm run build",
#   "deploy": "gh-pages -d dist"
# }

# Деплой
npm run deploy
```

### Backend (Render/Heroku/Railway)
1. Создайте `requirements.txt`
2. Создайте `Procfile`:
   ```
   web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
3. Укажите DATABASE_URL как переменную окружения

### Docker (опционально)
```dockerfile
# Frontend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "run", "preview"]

# Backend
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt ./
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 📝 Лицензия

MIT License

---

## 👨‍💻 Автор

Разработан командой **NLP-Core-Team**

---

## 🤝 Вклад

Внесите свой вклад в развитие проекта! Создавайте issue и pull request.

---

## 📞 Поддержка

Если у вас есть вопросы или предложения, создайте issue в репозитории.
