FROM python:3.12-slim

WORKDIR /app

COPY . .

RUN pip install uv && uv sync

CMD ["echo", "specify command in docker-compose"]