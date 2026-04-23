from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app.routers import tickets_router, users_router
from sqlalchemy import text
from app.routers import debat



app = FastAPI(title="TMA-Debat API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclure les routes
app.include_router(tickets_router, prefix="/api/tickets", tags=["tickets"])
app.include_router(users_router, prefix="/api/users", tags=["users"])

app.include_router(debat.router, prefix="/api/debat", tags=["debat"])

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
            return {"message": "DB OK", "result": result.scalar()}
    except Exception as e:
        return {"error": str(e)}