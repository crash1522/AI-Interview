from pydantic import BaseModel
import datetime
from typing import Optional, List


class Record(BaseModel):
    id: int
    user_id: int               
    create_date: datetime.datetime
    rating: Optional[int] = None
    nth_round: int
    company_name: Optional[str] = None

    class Config:
        orm_mode = True
        arbitrary_types_allowed = True

class RecordList(BaseModel):
    total: int = 0
    record_list: List[Record] = []
    

class RecordDelete(BaseModel):
    record_id: int