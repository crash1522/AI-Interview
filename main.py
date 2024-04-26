from fastapi import FastAPI, Depends
from fastapi.templating import Jinja2Templates
from fastapi import Request
from starlette.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles
from typing import Optional

from domain.answer import answer_router
from domain.question import question_router
from domain.user import user_router
from domain.record import record_router
from domain.feedback import feedback_router
from common import common_router
from common.handler import handler_router

app = FastAPI()
# docs URL 막는 코드, 나중에 배포 단계에서는 이렇게 해야함
#app = FastAPI(docs_url="/documentation", redoc_url=None)

origins = [
    "http://localhost",
    "http://localhost:8000",
    "https://mink-literate-grizzly.ngrok-free.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(question_router.router)
app.include_router(answer_router.router)
app.include_router(user_router.router)
app.include_router(record_router.router)
app.include_router(feedback_router.router)
app.include_router(common_router.router)
app.include_router(handler_router.router)

DOMAIN = "https://mink-literate-grizzly.ngrok-free.app"

@app.get("/")
async def home(request: Request, userid: Optional[str] = Depends(user_router.is_loggined)):
    return templates.TemplateResponse("home.html", {
        "request": request,
        "domain": DOMAIN
    })
