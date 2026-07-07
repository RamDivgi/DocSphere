from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import (
    OAuth2PasswordBearer,
    OAuth2PasswordRequestForm,
)
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token
from app.db.dependencies import get_db
from app.models.user import User
from app.schemas.auth import Token
from app.schemas.user import UserCreate, UserResponse
from app.services.auth_service import (
    authenticate_user,
    create_user,
    get_user_by_email,
)

router = APIRouter()


@router.post(
    "/signup",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def signup(
    user: UserCreate,
    db: Session = Depends(get_db),
):
    existing_user = get_user_by_email(db, user.email)

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    return create_user(
        db,
        full_name=user.full_name,
        email=user.email,
        password=user.password,
    )


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = authenticate_user(
        db,
        form_data.username,
        form_data.password,
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    access_token = create_access_token(user.id)

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


def get_current_user(
    token: str = Depends(
        OAuth2PasswordBearer(
            tokenUrl="/api/v1/auth/login"
        )
    ),
    db: Session = Depends(get_db),
):

    credentials_exception = HTTPException(
        status_code=401,
        detail="Invalid credentials",
    )

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )

        user_id = payload.get("sub")

    except JWTError:
        raise credentials_exception

    user = db.get(User, user_id)

    if not user:
        raise credentials_exception

    return user


@router.get("/me", response_model=UserResponse)
def me(
    current_user: User = Depends(get_current_user),
):
    return current_user