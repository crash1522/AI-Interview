import os
from dotenv import load_dotenv
import logging
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain.memory import ChatMessageHistory
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_community.document_loaders import WebBaseLoader
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.tools.retriever import create_retriever_tool
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler 
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.runnables import ConfigurableFieldSpec
from langchain.chat_models import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser


from common.handler import handler_schema
from typing import Dict
from openai import OpenAI

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
LANGCHAIN_API_KEY = os.getenv('LANGCHAIN_API_KEY')
TAVILY_API_KEY = os.getenv('TAVILY_API_KEY')
llm = ChatOpenAI(api_key=OPENAI_API_KEY)
stt_llm = OpenAI(api_key=OPENAI_API_KEY)

### Save chat history
store = {}

agent_dict: Dict[int, RunnableWithMessageHistory] = {}

# 주어진 session_id에 대한 이력 반환
def get_session_history(user_id:str, conversation_id:str) -> BaseChatMessageHistory:
    # 해당 세션 ID가 저장소에 없다면, 새로운 ChatMessageHistory 인스턴스를 생성하여 저장소에 추가
    if (user_id, conversation_id) not in store:
        store[(user_id, conversation_id)] = ChatMessageHistory()
    return store[(user_id, conversation_id)]


def create_agent(new_input: handler_schema.Input):
    user_info = new_input.user_info
    company_info = new_input.company_info
    cover_letter = new_input.cover_letter

    ask_output_parser= StrOutputParser()
    essential_question = " 귀사에 지원하게 된 동기가 무엇인가요 ?"
    
 
    ask_prompt = ChatPromptTemplate.from_messages(
    [
        # 조건 요구
        ("system",f""" 너는 채용 면접관으로써 오직 질문만 한다. 나는 지원자로써 너의 질문에 대답을 할 것이다. 너는 {user_info.field} 직무에 대해 면접 질문을 할 것이다. 
                        지원자의 자기소개서는 {cover_letter.content}이다. 회사의 요구사항은 {company_info.prefered_qualification}이다. 사용자가 설정한 {essential_question}은 반드시 한 번 질문한다. 자기소개서와 회사의 요구사항을 바탕으로 질문한다.
                        좀 더 구체적으로 너는 3명의 면접관 역할을 수행한다. 첫 째는 인사 담당자의 관점에서 자기소개서 바탕으로 {company_info.prefered_qualification}과 같은 돌발 질문을 한다.
                        둘 째는 자기소개서를 바탕으로 실무자의 관점에서 {user_info.field} 분야의 개발자가 면접에서 받을 수 있는 기본적인 cs 질문은 총 3개, 기술 질문 2개를 한다.
                        마지막은 내가 쓴 자기소개서를 읽고 임원진의 관점에서 인성 평가 질문을 한다. 설명이나 다른 형태의 대화는 제공하지 않는다.
                        대화의 방식은 실제 면접과 동일하다. 너의 질문에 내가 대답을 하면 다음 질문으로 넘어간다. 질문을 중복되게 생성 금지.
                        나의 답변에 대한 '추가' 질문을 3개를 한다. 그 후엔 다시 자소서 기반의 '새로운' 질문을 한다. 면접관의 역할은 절대 거론하지 않고, 질문만 제공한다.
                        너가 할 질문은 총 10개이며, 이 개수를 채우기 전에는 절대 면접을 종료하지 않는다."""),
        MessagesPlaceholder(variable_name="history"),
        ("human","{input}"),
    ]
    )
    ## llm 객체 생성
    ask_llm = ChatOpenAI(temperature=1.0, # 창의성(0.0 ~ 2.0)
                max_tokens=2048, 
                model_name='gpt-4-0125-preview', 
                streaming=True,
                # 대화 시 특정 이벤트가 발생할 때, 실행할 콜백 함수 지정(일반적으로 비동기식으로 실행됨)
                callbacks=[StreamingStdOutCallbackHandler()]) # 대화 중 stdout을 streaming하는 작업 처리, 그 결과에 대한 콜백을 다룸

    ask_chain = ask_prompt | ask_llm | ask_output_parser

    # 1. Load Retriever
    loader = WebBaseLoader("https://www.ttimes.co.kr/")
    docs = loader.load()
    text_splitter = RecursiveCharacterTextSplitter()
    documents = text_splitter.split_documents(docs)
    embeddings = OpenAIEmbeddings()
    vector = FAISS.from_documents(documents, embeddings)
    retriever = vector.as_retriever()

    # 2. Create Tools
    retriever_tool = create_retriever_tool(
        retriever,
        "news_search",
        "면접자의 직종과 관련된 최신 뉴스에 관하여 질문 할 때, 반드시 이 문서의 내용을 기반으로 질문한다.",
    )
    search = TavilySearchResults(k=2)
    tools = [retriever_tool, search]

    conversational_agent_executor = RunnableWithMessageHistory(
        ask_chain,
        get_session_history,
        input_messages_key="input",
        history_messages_key="history",
        history_factory_config=[
            ConfigurableFieldSpec(
                id="user_id",
                annotation=str,
                name="User ID",
                description="Unique identifier for the user.",
                default="",
                is_shared=True,
            ),
            ConfigurableFieldSpec(
                id="conversation_id",
                annotation=str,
                name="Conversation ID",
                description="Unique identifier for the conversation.",
                default="",
                is_shared=True,
            ),
        ],
    )
    
    return conversational_agent_executor
