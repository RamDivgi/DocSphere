from sqlalchemy.orm import Session

from app.core.security import (
    get_password_hash,
    verify_password,
)
from app.models.user import User


def get_user_by_email(
    db: Session,
    email: str,
):
    return (
        db.query(User)
        .filter(User.email == email)
        .first()
    )


def create_user(
    db: Session,
    full_name: str,
    email: str,
    password: str,
):

    user = User(
        full_name=full_name,
        email=email,
        hashed_password=get_password_hash(password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def authenticate_user(
    db: Session,
    email: str,
    password: str,
):

    user = get_user_by_email(
        db,
        email,
    )

    if not user:
        return None

    if not verify_password(
        password,
        user.hashed_password,
    ):
        return None

    return user