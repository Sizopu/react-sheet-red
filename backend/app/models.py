from sqlalchemy import Column, Integer, String, JSON, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    # Связь с таблицей персонажей
    characters = relationship("Character", back_populates="owner")

class Character(Base):
    __tablename__ = "characters"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    # Поле data будет хранить весь JSON с данными персонажа, как в localStorage
    data = Column(JSON, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"))

    # Связь с таблицей пользователей
    owner = relationship("User", back_populates="characters")