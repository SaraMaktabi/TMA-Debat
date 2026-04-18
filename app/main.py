from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from sqlalchemy import text

app = FastAPI(title="TMA-Debat API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "TMA-Debat backend running"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/test-db")
def test_db():
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            return {"message": "DB OK (TMA-Debat)", "result": result.scalar()}
    except Exception as e:
        return {"error": str(e)}