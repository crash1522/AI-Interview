# 베이스 이미지로 ubuntu:22.04 사용
FROM ubuntu:22.04

# 기본 패키지들 설치 및 Python 3 설치
RUN apt update && apt install -y python3-pip

# 애플리케이션 소스코드 추가
ADD . /app

# 8000번 포트 개방 (FastAPI 웹 애플리케이션을 8000번 포트에서 띄움)
EXPOSE 8000

# 작업 디렉토리로 이동
WORKDIR /app

# ARG 정의 (빌드 시 환경변수 전달 받기)
ARG OPENAI_API_KEY
ARG ACCESS_TOKEN_EXPIRE_MINUTES
ARG GIT_ACCESS_TOKEN
ARG SECRET_KEY
ARG SQLALCHEMY_DATABASE_URL
ARG SQLALCHEMY_DATABASE_URL_ASYNC
ARG TAVILY_API_KEY

# 환경변수 설정
ENV OPENAI_API_KEY=${OPENAI_API_KEY} \
    ACCESS_TOKEN_EXPIRE_MINUTES=${ACCESS_TOKEN_EXPIRE_MINUTES} \
    GIT_ACCESS_TOKEN=${GIT_ACCESS_TOKEN} \
    SECRET_KEY=${SECRET_KEY} \
    SQLALCHEMY_DATABASE_URL=${SQLALCHEMY_DATABASE_URL} \
    SQLALCHEMY_DATABASE_URL_ASYNC=${SQLALCHEMY_DATABASE_URL_ASYNC} \
    TAVILY_API_KEY=${TAVILY_API_KEY}

# 데이터베이스 URL 확인
RUN echo $SQLALCHEMY_DATABASE_URL

# 작업 디렉토리에 있는 requirements.txt로 패키지 설치
RUN pip install -r requirements.txt

# PostgreSQL 라이브러리 설치
RUN apt-get update && apt-get install -y libpq-dev

# 데이터베이스 마이그레이션 실행
RUN alembic upgrade head

# 컨테이너에서 실행될 명령어.
CMD ["uvicorn", "main:app", "--reload", "--host", "0.0.0.0"]
