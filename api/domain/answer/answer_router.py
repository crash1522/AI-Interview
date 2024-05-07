from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
import io
import json
from asyncio import create_task

from database import get_db
from domain.answer import answer_schema, answer_crud
from domain.question import question_crud
from domain.user.user_router import get_current_user
from domain.feedback import feedback_crud
from common.handler.handler_router import q_cnt_dict
from common.agent import agent_dict, stt_llm

router = APIRouter(
    prefix="/api/answer",
)


#유저 대답 음성파일을 받으면 텍스트로 변환
@router.post("/user_answer_create/{question_id}", response_model=answer_schema.AnswerReponse)
async def user_answer_create(question_id: int,
                             db: Session = Depends(get_db), 
                             file: UploadFile = File(...), 
                             user = Depends(get_current_user)):
    global q_cnt_dict, agent_dict
    question = question_crud.get_question(db, question_id=question_id)
    if not question:
        raise HTTPException(status_code=404,
                             detail="No unanswered interview question found in the session")
    
    user_voice_answer = io.BytesIO(await file.read())
    user_voice_answer.name = "file.mp3"  # this is the important line

    # STT
    user_text_answer = stt_llm.audio.transcriptions.create(
    model="whisper-1", # 모델 유형 설정
    file=user_voice_answer, # text로 전환할 음성 데이터
    response_format="json" # 응답 타입 설정(json, text, srt, verbose_json, vtt)
    )
    if not user_text_answer:
        raise HTTPException(status_code = 500, detail="Failed to transctipt when using STT. answer_router.py line 37")

    # transcription 객체를 JSON 문자열로 변환
    user_text_answer_json = json.loads(user_text_answer.model_dump_json())
    converted_text = user_text_answer_json['text']
    answer = answer_crud.create_answer(db=db, #db,question 임시값
                                question=question,
                                answer_create=answer_schema.AnswerCreate(content = converted_text)
                              )
    if not answer:
        raise HTTPException(status_code = 500, detail="Failed to create answer. answer_router.py line 47")
    
    # 답변에 대한 피드백 생성 백그라운드 작업
    create_task(feedback_crud.get_feedback_from_LLM(question=question, answer=answer, db=db))
    
    #  client 쪽에서 작업하기 쉬운 형태로 변환
    question_id = answer.question_id
    record_id = answer.question.record.id
    answer_response = answer_schema.AnswerReponse(
         id = answer.id,
         content = answer.content,
         question_id = question_id,
         record_id = record_id,
    )

    # 마지막 질문일 경우 처리
    if q_cnt_dict[record_id].required_question_num == q_cnt_dict[record_id].cur_question_num:
        answer_response.last_question_flag = True
        del agent_dict[record_id]   
        del q_cnt_dict[record_id]
    return answer_response
