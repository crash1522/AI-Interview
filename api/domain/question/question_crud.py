from datetime import datetime
from sqlalchemy.orm import Session

from domain.question.question_schema import QuestionCreate, QuestionUpdate
from models import Question


def get_question(db: Session, question_id: int):
    question = db.query(Question).get(question_id)
    return question


def create_question(db: Session, question_create: QuestionCreate, record_id: int):
    db_question = Question(content=question_create.content,
                           record_id=record_id)
    db.add(db_question)
    db.commit()
    db.refresh(db_question)  # 생성된 질문 인스턴스를 최신 상태로 업데이트
    return db_question


def update_question(db: Session, db_question: Question,
                    question_update: QuestionUpdate):
    db_question.content = question_update.content
    db.add(db_question)
    db.commit()


def delete_question(db: Session, db_question: Question):
    db.delete(db_question)
    db.commit()


# async examples
async def async_create_question(db: Session, question_create: QuestionCreate):
    db_question = Question(
                           content=question_create.content,
                           create_date=datetime.now())
    db.add(db_question)
    await db.commit()
