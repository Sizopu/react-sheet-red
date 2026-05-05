# auth.py - только для совместимости, основные функции в auth_utils.py
from .auth_utils import (
    SECRET_KEY,
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    verify_password,
    get_password_hash,
    create_access_token
)