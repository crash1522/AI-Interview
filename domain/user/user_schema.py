from pydantic import BaseModel, validator,  Field
from typing import List, Optional
import datetime

class UserCreate(BaseModel):
    userid: str
    username: str
    password: str
    confirm_password: str
    field: str
    skills: List[str] = Field(default=[])

    @validator('userid','username', 'password', 'confirm_password')
    def not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('빈 값은 허용되지 않습니다.')
        return v

    @validator('confirm_password')
    def passwords_match(cls, v, values):
        if 'password' in values and v != values['password']:
            raise ValueError('비밀번호가 일치하지 않습니다')
        return v


class UserDelete(BaseModel):
    userid: str


class User(BaseModel):
    id: int
    userid: str
    username: str
    field: str
    skills: List[str] = Field(default=[])
    
    class Config:
        orm_mode = True


class Token(BaseModel):
    access_token: str
    token_type: str
    userid: str
    user_profile: User


class UserIdRequest(BaseModel):
    userid: str


class UserRecords(BaseModel):
    nth_round: int
    create_date: datetime.datetime
    company_name: Optional[str] = None
    record_id: int

class UserRecordsList(BaseModel):
    records_list: List[UserRecords]