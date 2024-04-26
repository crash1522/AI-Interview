from pydantic import BaseModel, Field
from typing import List

class CompanyInfo(BaseModel):
    name: str = "Unknown Company"
    works: str = "Nan"
    prefered_qualification: str = "No preference"
    desired_candidate: str = "Open to all"


class UserInfo(BaseModel):
    username: str
    field: str
    skills: List[str] = Field(default=[])


class CoverLetter(BaseModel):
    content: List[str] = []


class Input(BaseModel):
    company_info: CompanyInfo
    cover_letter: CoverLetter
    user_info: UserInfo
    q_num: int = 10