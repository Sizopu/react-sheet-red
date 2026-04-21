from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import crud, schemas, database
from ..dependencies import get_current_user

router = APIRouter(prefix="/characters", tags=["characters"])

@router.get("/", response_model=List[schemas.Character])
def read_characters(
    db: Session = Depends(database.get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """Получить всех персонажей текущего пользователя."""
    return crud.get_characters(db, owner_id=current_user.id)

@router.post("/", response_model=schemas.Character, status_code=status.HTTP_201_CREATED)
def create_character(
    character: schemas.CharacterCreate,
    db: Session = Depends(database.get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """Создать нового персонажа."""
    return crud.create_character(db=db, character=character, owner_id=current_user.id)

@router.get("/{character_id}", response_model=schemas.Character)
def read_character(
    character_id: int,
    db: Session = Depends(database.get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """Получить конкретного персонажа."""
    db_character = crud.get_character(db, character_id=character_id, owner_id=current_user.id)
    if db_character is None:
        raise HTTPException(status_code=404, detail="Character not found")
    return db_character

@router.put("/{character_id}", response_model=schemas.Character)
def update_character(
    character_id: int,
    character_update: schemas.CharacterUpdate,
    db: Session = Depends(database.get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """Обновить персонажа."""
    db_character = crud.update_character(db, character_id, character_update, owner_id=current_user.id)
    if db_character is None:
        raise HTTPException(status_code=404, detail="Character not found")
    return db_character

@router.delete("/{character_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_character(
    character_id: int,
    db: Session = Depends(database.get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """Удалить персонажа."""
    db_character = crud.delete_character(db, character_id, owner_id=current_user.id)
    if db_character is None:
        raise HTTPException(status_code=404, detail="Character not found")
    return {"ok": True}