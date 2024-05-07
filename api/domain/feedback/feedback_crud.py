from sqlalchemy.orm import Session
from langchain.chat_models import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from domain.feedback.feedback_schema import FeedbackCreate
from domain.question.question_schema import Question
from domain.answer.answer_schema import Answer
from models import Answer, Feedback

chat_template = ChatPromptTemplate.from_messages(
    [
        ("system", "This system analyzes the interviewer's questions and the applicant's answers to provide applicants with advice to help them pass the interview. When providing advice to an applicant, start with 'Interview Feedback: 지원자님은' and express it in line text. Avoid using unprofessional or casual language and frame your advice using professional terminology appropriate to the interview situation. Please speak in Korean"),
        ("user", "Please provide applicants with advice to help them pass the interview based on the following questions and answers. Please speak in Korean. \n질문: {question}\n답변: {answer}"),
    ]
)

# feedback data로 fine-tuningg한 LLM 불러오기
chatgpt = ChatOpenAI(model_name="ft:gpt-3.5-turbo-0125:personal::9BaVTr6d")

# 출력 유형 설정
output_parser = StrOutputParser()

# prompt, LLM, output_parser를 chain으로 묶기
chain = chat_template | chatgpt | output_parser


def create_feedback(db: Session, answer: Answer,
                  feedback_create: FeedbackCreate):
    db_feedback = Feedback(answer_id = answer.id,
                         content = feedback_create.content
                         )
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)
    return db_feedback

async def get_feedback_from_LLM(question: Question, answer: Answer, db: Session):
    # 답변에 대한 피드백 생성
    global chain
    feedback_request = [{'question': question.content, 'answer': answer.content}]
    response = await chain.abatch(feedback_request)
    if response:
        create_feedback(db=db, answer=answer, feedback_create=FeedbackCreate(content = response[0]))
    else:
        print("Failed to request feedback to openai")
    print(response)

def get_feedback(db: Session, feedback_id: int) -> Feedback:
    feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    return feedback


def get_feed_by_answer_id(db: Session, answer_id: int) -> Answer:
    return db.query(Feedback.answer_id==answer_id)


def delete_feedback(db: Session, db_feedback: Feedback):
    db.delete(db_feedback)
    db.commit()