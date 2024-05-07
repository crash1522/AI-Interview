from pydantic import BaseModel

class Feedback(BaseModel):
    id: int
    answer_id: int
    content: str               

    class Config:
        orm_mode = True
        arbitrary_types_allowed = True

class FeedbackCreate(BaseModel):
    content: str

class FeedbackDelete(BaseModel):
    feedback_id: int