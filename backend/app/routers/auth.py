# backend/app/routers/auth.py
from datetime import timedelta
from typing import Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import Token, UserCreate
from ..core.security import create_access_token, get_password_hash, verify_password, ACCESS_TOKEN_EXPIRE_MINUTES
from jose import JWTError, jwt
from ..core.security import SECRET_KEY, ALGORITHM

router = APIRouter(prefix="/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

async def get_current_user_optional(token: Annotated[Optional[str], Depends(OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False))], db: Session = Depends(get_db)):
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
    except JWTError:
        return None
    
    user = db.query(User).filter(User.email == email).first()
    return user

@router.post("/signup", response_model=Token)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = User(email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": new_user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me")
def read_users_me(
    current_user: Annotated[User, Depends(get_current_user)], 
    db: Session = Depends(get_db)  # Inject DB session
):
    from ..models import WorkflowInstance, Execution, ExecutionStatus
    
    # 1. Count Active Automations
    active_automations_count = db.query(WorkflowInstance).filter(
        WorkflowInstance.user_id == current_user.id,
        WorkflowInstance.is_active == True
    ).count()

    # 2. Total Executions
    total_executions_count = db.query(Execution).filter(
        Execution.user_id == current_user.id
    ).count()

    # 3. Success Rate
    success_count = db.query(Execution).filter(
        Execution.user_id == current_user.id,
        Execution.status == ExecutionStatus.SUCCESS
    ).count()

    success_rate = 0
    if total_executions_count > 0:
        success_rate = round((success_count / total_executions_count) * 100)

    return {
        "email": current_user.email, 
        "id": str(current_user.id), 
        "credits": current_user.credits_balance,
        "is_admin": current_user.is_admin,
        "active_automations_count": active_automations_count,
        "total_executions_count": total_executions_count,
        "success_rate": success_rate
    }
