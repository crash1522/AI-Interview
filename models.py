from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from database import Base


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True)
    content = Column(Text)
    answer_id = Column(Integer, ForeignKey("answer.id"))

    answer = relationship("Answer", back_populates="feedback", uselist=False)

class Answer(Base):
    __tablename__ = "answer"

    id = Column(Integer, primary_key=True)
    content = Column(Text, nullable=False)
    question_id = Column(Integer, ForeignKey("question.id"))

    question = relationship("Question", back_populates="answer", uselist=False)
    feedback = relationship("Feedback", back_populates="answer", uselist=False)

class Question(Base):
    __tablename__ = "question"

    id = Column(Integer, primary_key=True)
    content = Column(Text, nullable=False)
    record_id = Column(Integer, ForeignKey("record.id"))

    answer = relationship('Answer', back_populates='question', uselist=False)
    record = relationship("Record", back_populates="questions")

class Record(Base):
    __tablename__ = "record"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("user.id"))
    create_date = Column(DateTime, nullable=False)
    rating = Column(Integer, nullable = True)
    nth_round = Column(Integer)
    company_name = Column(String, nullable = True)

    user = relationship("User", back_populates="records")
    questions = relationship('Question', back_populates = "record")

    arbitrary_types_allowed=True

class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True)
    userid = Column(String, unique=True, nullable=False)
    username = Column(String, unique=False, nullable=False)
    password = Column(String, nullable=False)
    field = Column(String)

    skills = relationship("Skill", back_populates="user")
    records = relationship("Record", back_populates="user")
   
class Skill(Base):
    __tablename__ = "skill"
    
    id = Column(Integer, primary_key=True)
    skill_name = Column(String, nullable=False)
    userid = Column(String, ForeignKey('user.userid'), nullable=False)

    user = relationship("User", back_populates="skills")