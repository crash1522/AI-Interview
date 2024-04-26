from datetime import datetime
from sqlalchemy.orm import Session

from domain.answer.answer_schema import AnswerCreate, AnswerUpdate
from models import Question, Answer


def create_answer(db: Session, question: Question,
                  answer_create: AnswerCreate):
    db_answer = Answer(question_id=question.id,
                       content=answer_create.content)
    db.add(db_answer)
    db.commit()
    db.refresh(db_answer)
    return db_answer


def get_answer(db: Session, answer_id: int):
    return db.query(Answer).get(answer_id)

def get_answer_by_question_id(db: Session, question_id: int):
    return db.query(Answer.question_id==question_id)

def update_answer(db: Session, db_answer: Answer,
                  answer_update: AnswerUpdate):
    db_answer.content = answer_update.content
    db_answer.modify_date = datetime.now()
    db.add(db_answer)
    db.commit()


def delete_answer(db: Session, db_answer: Answer):
    db.delete(db_answer)
    db.commit()
