from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth, characters

# Создаем таблицы в БД, если их еще нет
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Cyberpunk RED Character Sheet API")

# Настройка CORS, чтобы фронтенд мог общаться с бэкендом
origins = [
    "http://localhost:3000",  # Адрес вашего React-приложения
    "http://localhost:5173",  # Стандартный порт Vite
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем роутеры
app.include_router(auth.router)
app.include_router(characters.router)

@app.get("/")
async def root():
    return {"message": "Welcome to Cyberpunk RED Character Sheet API"}