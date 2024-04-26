from passlib.context import CryptContext
from sqlalchemy.orm import Session

from domain.user import user_schema
from models import User, Skill, Record

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

"""
create 관련 함수

create_user(db: Session, user_create: UserCreate)
add_skill_to_user(db: Session, userid: str, skill_name: str) -> Skill
"""
# 새로운 user를 생성합니다. (회원가입)
def create_user(db: Session, user_create: user_schema.UserCreate):
    db_user = User(
                   userid=user_create.userid,
                   username=user_create.username,
                   password=pwd_context.hash(user_create.password),
                   field=user_create.field
                   )
    db.add(db_user)
    for skill_name in user_create.skills:
        db_skill = Skill(skill_name=skill_name, user=db_user)  # User 객체를 Skill에 할당
        db.add(db_skill)

    db.commit()  # 변경사항을 데이터베이스에 커밋
    

# 주어진 userid에 해당하는 사용자에게 새로운 기술을 추가합니다.
def add_skill_to_user(db: Session, userid: str, skill_name: str):
    # 새로운 Skill 객체 생성
    new_skill = Skill(skill_name=skill_name, userid=userid)
    db.add(new_skill)
    db.commit()
    db.refresh(new_skill)
    return new_skill


"""
Read 관련 함수들

get_existing_user(db: Session, user_create: UserCreate) -> User
get_user(db: Session, userid: str) -> User
get_id(db: Session, userid: str) -> int
get_username(db: Session, userid: str) -> str
get_skills(db: Session, userid: str) -> list
get_field(db: Session, userid: str) -> str
 """


# userid에 해당하는 id (primary key)를 반환합니다.
def get_id(db: Session, userid: str):
    user = db.query(User).filter(User.userid == userid).first()
    if not user:
        return -1
    return user.id


# 회원가입 창에서 사용자가 입력한 id가 이미 존재하는 회원인지 확인합니다.
def get_existing_user(db: Session, user_create: user_schema.UserCreate):
    return db.query(User).filter(
        (User.id == get_id(db=db,userid=user_create.userid))
    ).first()


# userid에 해당하는 User 객체를 반환합니다.
def get_user(db: Session, userid: str):
    return db.query(User).filter(User.id == get_id(db=db,userid=userid)).first()

# 해당 userid의 username을 반환합니다.
def get_username(db: Session, userid: str):
    user = db.query(User).filter(User.id == get_id(db=db,userid=userid)).first()

    if not user:
        return []
    username = user.username
    return username


# 주어진 userid에 해당하는 사용자의 기술 스택을 반환합니다.
def get_skills(db: Session, userid: str):
    # 특정 유저의 ID를 사용하여 User 객체를 조회합니다.
    user = db.query(User).filter(User.id == get_id(db=db,userid=userid)).first()
    
    # 유저를 찾지 못한 경우, 빈 리스트 반환
    if not user:
        return []

    # 유저가 가진 기술 스택(Skill)의 이름을 리스트로 반환합니다.
    skills = [skill.skill_name for skill in user.skills]
    return skills


# 주어진 userid에 해당하는 사용자의 분야 정보를 반환합니다.
def get_field(db: Session, userid: str):
    user = db.query(User).filter(User.id == get_id(db=db,userid=userid)).first()

    if not user:
        return ""
    field = user.field
    return field


def get_records_by_userid(db: Session, userid: str):
    records = db.query(Record).filter(Record.user_id == get_id(db=db,userid=userid)).order_by(Record.create_date).all()
    return records


def get_record_num(db: Session, userid: str):
    return len(get_records_by_userid(db=db, userid=userid))

"""
Update 관련 함수들

set_username(db: Session, userid: str, new_username: str) -> str
""" 
# 주어진 userid에 해당하는 사용자의 username을 설정합니다.
def set_username(db: Session, userid: str, new_username: str):
    # 주어진 ID를 가진 사용자를 찾습니다.
    user = db.query(User).filter(User.userid == userid).first()
    
    # 사용자명을 업데이트하고 데이터베이스 세션을 커밋합니다.
    user.username = new_username
    db.commit()
    
    # 업데이트된 사용자 정보를 반환합니다. 실제 반환 타입이나 내용은 요구 사항에 따라 달라질 수 있습니다.
    return user.username

def get_user_profile(user: User, db:Session):
    user_profile = user_schema.User(id=user.id,
                        userid=user.userid,
                        field=user.field,
                        username=user.username,
                        skills=get_skills(db=db, userid= user.userid))
    return user_profile
"""
Delete 관련 함수들


delete_skill_from_user(db: Session, userid: str, skill_name: str) -> None
"""
# 해당하는 userid의 User를 DB에서 삭제합니다.(회원탈퇴)
def delete_user(db: Session, userid: str):
    user = db.query(User).filter(User.id==get_id(db=db,userid=userid)).first()
    
    db.delete(user)
    db.commit()

# 주어진 userid에 해당하는 사용자의 특정 기술을 삭제합니다.
def delete_skill_from_user(db: Session, userid: str, skill_name: str):
    # 해당 사용자의 특정 기술 스택을 찾습니다.
    skill_to_delete = db.query(Skill).filter(
        Skill.userid == userid, 
        Skill.skill_name == skill_name
    ).first()
    
    # 해당 기술 스택이 존재하면 삭제
    if skill_to_delete:
        db.delete(skill_to_delete)
        db.commit()
    
    # 예외 처리를 해야할까?