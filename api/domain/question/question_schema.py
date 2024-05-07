from pydantic import BaseModel, validator
from typing import List

class Question(BaseModel):
    id: int
    content: str
    record_id: int

    class Config:
        orm_mode = True
        arbitrary_types_allowed = True


class QuestionCreate(BaseModel):
    content: str

    @validator('content')
    def not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('빈 값은 허용되지 않습니다.')
        return v


class QuestionList(BaseModel):
    total: int = 0
    question_list: List[Question] = []


class QuestionUpdate(QuestionCreate):
    question_id: int


class QuestionDelete(BaseModel):
    question_id: int


class QuestionCount(BaseModel):
    required_question_num: int
    cur_question_num: int
