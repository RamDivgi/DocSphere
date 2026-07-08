import uuid
from fastapi import Header, HTTPException, status

def get_session_id(x_session_id: str = Header(None)) -> uuid.UUID:
    if not x_session_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="X-Session-ID header is missing",
        )
    try:
        return uuid.UUID(x_session_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="X-Session-ID is not a valid UUID",
        )