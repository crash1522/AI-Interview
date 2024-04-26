from pydantic import BaseModel, validator

class AnswerCreate(BaseModel):
    content: str

    @validator('content')
    def not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('빈 값은 허용되지 않습니다.')
        return v


class Answer(BaseModel):
    id: int
    content: str
    question_id: int
 
    class Config:
        orm_mode = True
        arbitrary_types_allowed = True


class AnswerUpdate(AnswerCreate):
    answer_id: int


class AnswerDelete(BaseModel):
    answer_id: int


class AnswerReponse(BaseModel):
    id: int
    content: str
    question_id: int
    record_id: int
    last_question_flag: bool = False