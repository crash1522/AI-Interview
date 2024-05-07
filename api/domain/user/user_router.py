from datetime import timedelta, datetime

from fastapi import APIRouter, HTTPException, Request, Response
from fastapi import Depends
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi.templating import Jinja2Templates
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from starlette import status
from typing import Optional
import os

from database import get_db
from domain.user import user_crud, user_schema
from domain.user.user_crud import pwd_context
from models import User

ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES'))
SECRET_KEY = os.getenv('SECRET_KEY')
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/user/login")
templates = Jinja2Templates(directory="templates")

router = APIRouter(
    prefix="/api/user",
)


def get_current_user(token: str = Depends(oauth2_scheme),
                     db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        userid: str = payload.get("sub")
        if userid is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    else:
        user = user_crud.get_user(db, userid=userid)
        if user is None:
            raise credentials_exception
        return user


async def is_loggined(request: Request) -> Optional[str]:
    token = request.cookies.get('access_token')  # 예를 들어 쿠키에서 토큰을 가져옵니다.
    if not token:
        return ""  # 토큰이 없으면 None 반환    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        userid: str = payload.get("sub")
        if userid is None:
            return ""
        return userid
    except JWTError:
        return ""


# 유저를 생성합니다. (회원가입) 
@router.post("/create", status_code=status.HTTP_204_NO_CONTENT)
def user_create(_user_create: user_schema.UserCreate, db: Session = Depends(get_db)):
    user = user_crud.get_existing_user(db, user_create=_user_create)
    if user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                            detail="이미 존재하는 사용자입니다.")
    user_crud.create_user(db=db, user_create=_user_create)


@router.post("/create/is_duplcate")
def is_duplcate(request: user_schema.UserIdRequest, db: Session = Depends(get_db)):
    userid = request.userid
    user = user_crud.get_user(db, userid=userid)
    if user:
        return {"message": "이미 존재하는 아이디입니다."}
    else:
        return {"message": "사용 가능한 아이디입니다."}


# 로그인
@router.post("/login", response_model=user_schema.Token)
def login_for_access_token(response: Response, form_data: OAuth2PasswordRequestForm = Depends(),
                           db: Session = Depends(get_db)):

    # check user and password
    user = user_crud.get_user(db, form_data.username)
    if not user or not pwd_context.verify(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="아이디 또는 비밀번호를 잘못 입력했습니다.\n입력하신 내용을 다시 확인해주세요.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # make access token
    payload = {
        "sub": user.userid,
        "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    }
    access_token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=True, path="/")
    response.set_cookie(key="userid", value=user.userid, httponly=True, secure=True, path="/")
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "userid": user.userid,
        "user_profile": user_crud.get_user_profile(db=db, user=user)
    }


@router.get("/logout")
async def logout(request: Request):
    response = templates.TemplateResponse("home.html", {"request":request})
    response.delete_cookie(key="access_token", path="/")
    return response


@router.get("/profile", response_model = user_schema.User)
def user_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_profile = user_schema.User(
        id=current_user.id,
        userid=current_user.userid,
        field=current_user.field,
        username=current_user.username,
        skills=user_crud.get_skills(db=db, userid= current_user.userid))
    if not user_profile:
        raise HTTPException(
            status_code = status.HTTP_404_NOT_FOUND,
            detail = "유저 프로필을 찾을 수 없습니다.")
    return user_profile

# nth round, created_date, company_name, record_id
@router.get("/get_records", response_model=user_schema.UserRecordsList)
async def get_user_records(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    records = user_crud.get_records_by_userid(db=db, userid=current_user.userid)
    if not records:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail = "No records matching userid.")
    records_list = []
    
    for record in records:
        user_record = user_schema.UserRecords(
            record_id = record.id,
            nth_round = record.nth_round,
            create_date = record.create_date,
            company_name = record.company_name
        )
        records_list.append(user_record)
    user_record_list = user_schema.UserRecordsList(records_list=records_list)
    return user_record_list
    

"""
# 유저를 삭제합니다. (회원탈퇴)
@router.post("/withdrawal", status_code=status.HTTP_204_NO_CONTENT)
def user_delete(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):

    records = user_crud.get_records_by_userid(db=db, userid=current_user.userid)
    for record in records:
        delete_record(db=db, db_record=record)
    user_crud.delete_user(db=db, userid=current_user.userid)
"""