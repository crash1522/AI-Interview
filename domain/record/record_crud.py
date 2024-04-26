from sqlalchemy.orm import Session
from datetime import datetime

from domain.record.record_schema import Record
from domain.user import user_crud 
from models import User, Record, Question, Answer, Feedback


def get_record(db: Session, record_id: int):
    record = db.query(Record).filter(Record.id == record_id).first()
    return record


def get_all_data_by_record_id(db: Session, record_id: int):
    questions = db.query(Question).filter(Question.record_id == record_id).all()
    if not questions:
        return None
    answers = []
    feedbacks = []
    for question in questions:
        answer = db.query(Answer).filter(Answer.question_id==question.id).first()
        answers.append(answer)
        if answer:
            feedback = db.query(Feedback).filter(Feedback.answer_id==answer.id).first()
            feedbacks.append(feedback)
        else:
            feedbacks.append(None)
    
    return questions, answers, feedbacks

# nth_round 검증하기
def create_record(db: Session, user: User):
    # 특정 사용자의 기존 레코드 수 계산
    nth_round = db.query(Record).filter(Record.user_id == user.id).count() + 1

    # 새로운 레코드 생성
    db_record = Record(
        user_id=user.id,  # User 객체에서 바로 ID를 참조
        create_date=datetime.now(),
        nth_round=nth_round
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)  # 생성된 레코드 인스턴스를 최신 상태로 업데이트
    return db_record

def set_record_company_name(db: Session, db_record: Record, new_company_name: str):

    record = db.query(Record).filter(Record.id == db_record.id).first()
    
    # 사용자명을 업데이트하고 데이터베이스 세션을 커밋합니다.
    record.company_name = new_company_name
    db.commit()
    db.refresh(record)
    # 업데이트된 사용자 정보를 반환합니다. 실제 반환 타입이나 내용은 요구 사항에 따라 달라질 수 있습니다.
    return record


def delete_record(db: Session, db_record: Record):
    db.delete(db_record)
    db.commit()