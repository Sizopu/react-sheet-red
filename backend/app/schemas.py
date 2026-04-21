from pydantic import BaseModel
from typing import Optional, Dict, Any

# --- Схемы для аутентификации ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    class Config:
        from_attributes = True

# --- Схемы для персонажей ---
class CharacterBase(BaseModel):
    name: str

class CharacterCreate(CharacterBase):
    data: Dict[str, Any]  # Принимаем JSON с данными

class CharacterUpdate(CharacterBase):
    data: Dict[str, Any]

class Character(CharacterBase):
    id: int
    data: Dict[str, Any]
    owner_id: int

    class Config:
        from_attributes = True