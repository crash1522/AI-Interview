from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from domain.question import question_schema, question_crud
from domain.answer import answer_crud
from domain.user import user_router
from common.agent import agent_dict
from common.handler.handler_router import q_cnt_dict
from models import User
from database import get_db

router = APIRouter(
    prefix="/api/question",
)

@router.post("/question_create/{record_id}", response_model=question_schema.Question)
async def question_create(record_id: int,
                         before_answer_id: int,
                         db: Session = Depends(get_db),
                         current_user: User = Depends(user_router.get_current_user)):
    global agent_dict, q_cnt_dict
    try:
        conversational_agent_executor = agent_dict[record_id]
    except:
        raise HTTPException(status_code=404, detail=f"Not Valid record id (record id: {record_id})")
    if not before_answer_id:
        # 초기 프롬프트 설정 이후 해당 키값 삭제
        greeting = f"안녕하세요, {current_user.field} 직군에 지원한 {current_user.username}입니다."
        chat_response  = await conversational_agent_executor.ainvoke(
            {"input": greeting},
             config={"configurable":{"user_id":current_user.id, "conversation_id":record_id}},
        )
    else:
        before_answer = answer_crud.get_answer(db=db, answer_id=before_answer_id)
        user_answer = before_answer.content if before_answer else None
    
        # 챗봇으로부터 다음 면접 질문을 받아옴
        chat_response = await conversational_agent_executor.ainvoke(
            {"input": user_answer},  # 사용자의 면접 대답 전달
            config={"configurable":{"user_id":current_user.id, "conversation_id":record_id}},
        )
    if chat_response:
        new_question_content = chat_response
        new_question = question_crud.create_question(db=db,
                                                     question_create=question_schema.QuestionCreate(content = new_question_content),
                                                     record_id=record_id)
        q_cnt_dict[record_id].cur_question_num += 1
        return new_question
    else:
        raise HTTPException(status_code=500, detail="Failed to receive a new question from the chatbot")
