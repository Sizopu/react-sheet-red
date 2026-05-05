from sqlalchemy.orm import Session
from . import models, schemas
from .auth_utils import get_password_hash

# --- CRUD для пользователей ---
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(username=user.username, email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- CRUD для персонажей ---
def get_characters(db: Session, owner_id: int):
    """Получить всех персонажей пользователя."""
    return db.query(models.Character).filter(models.Character.owner_id == owner_id).all()

def get_character(db: Session, character_id: int, owner_id: int):
    """Получить конкретного персонажа пользователя."""
    return db.query(models.Character).filter(
        models.Character.id == character_id,
        models.Character.owner_id == owner_id
    ).first()

def create_character(db: Session, character: schemas.CharacterCreate, owner_id: int):
    """Создать нового персонажа."""
    db_character = models.Character(**character.dict(), owner_id=owner_id)
    db.add(db_character)
    db.commit()
    db.refresh(db_character)
    return db_character

def update_character(db: Session, character_id: int, character_update: schemas.CharacterUpdate, owner_id: int):
    """Обновить данные персонажа."""
    db_character = get_character(db, character_id, owner_id)
    if db_character:
        db_character.name = character_update.name
        db_character.data = character_update.data
        db.commit()
        db.refresh(db_character)
    return db_character

def delete_character(db: Session, character_id: int, owner_id: int):
    """Удалить персонажа."""
    db_character = get_character(db, character_id, owner_id)
    if db_character:
        db.delete(db_character)
        db.commit()
    return db_character