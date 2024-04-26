from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from starlette import status

from database import get_db
from domain.user.user_router import get_current_user
from domain.feedback import feedback_schema, feedback_crud
from domain.record import record_crud
from models import User

router = APIRouter(
    prefix="/api/feedback",
)


@router.post("/create/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
async def feedback_create(record_id,
                  db: Session = Depends(get_db),
                  current_user: User = Depends(get_current_user)):
    global chain
    feedback_request = []

    data = record_crud.get_all_data_by_record_id(db, record_id=record_id)
    if not data:
        raise HTTPException(status_code=404, detail="No data found for this record.")

    questions, answers, feedbacks = data
    
    # 피드백 요청 데이터 생성
    for question, answer in zip(questions, answers):
        if answer and question:
            feedback_request.append({'question': question.content, 'answer': answer.content})

    # 비동기 피드백 생성
    if feedback_request:
        feedback_responses = await chain.abatch(feedback_request)
    else:
        feedback_responses = []

    print(feedback_responses)
    for answer, response in zip(answers, feedback_responses):
        if response:  # 피드백 내용이 있는 경우에만 생성
            feedback = feedback_crud.create_feedback(db, answer=answer, feedback_create=feedback_schema.FeedbackCreate(content=response))
            print(feedback)  # 로그 출력


@router.get("/detail/{feedback_id}", response_model=feedback_schema.Feedback)
def feedback_detail(feedback_id: int, db: Session = Depends(get_db)):
    feedback = feedback_crud.get_feedback(db, feedback_id=feedback_id)
    if not feedback:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feedback not found.")
    return feedback


@router.delete("/delete", status_code=status.HTTP_204_NO_CONTENT)
def feedback_delete(_feedback_delete: feedback_schema.FeedbackDelete,
                  db: Session = Depends(get_db),
                  current_user: User = Depends(get_current_user)):
    db_feedback = feedback_crud.get_feedback(db, feedback_id=_feedback_delete.feedback_id)
    if not db_feedback:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="데이터를 찾을수 없습니다.")
    feedback_crud.delete_feedback(db=db, db_feedback=db_feedback)