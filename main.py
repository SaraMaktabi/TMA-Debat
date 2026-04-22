# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from app.database import engine
# from sqlalchemy import text

# app = FastAPI(title="TMA-Debat API")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# @app.get("/")
# def root():
#     return {"message": "TMA-Debat backend running"}

# @app.get("/health")
# def health():
#     return {"status": "ok"}

# @app.get("/test-db")
# def test_db():
#     try:
#         with engine.connect() as connection:
#             result = connection.execute(text("SELECT 1"))
#             return {"message": "DB OK (TMA-Debat)", "result": result.scalar()}
#     except Exception as e:
#         return {"error": str(e)}

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import engine, Base, get_db
from models import Ticket
from schemas import TicketCreate

Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# TEST
@app.get("/")
def root():
    return {"message": "API OK"}

# GET ALL TICKETS
@app.get("/tickets")
def get_tickets(db: Session = Depends(get_db)):
    return db.query(Ticket).order_by(Ticket.created_at.desc()).all()

# CREATE TICKET
@app.post("/tickets")
def create_ticket(ticket: TicketCreate, db: Session = Depends(get_db)):

    db_ticket = Ticket(
        company_name=ticket.companyName,
        email=ticket.email,
        title=ticket.title,
        category=ticket.category,
        urgency=ticket.urgency,
        description=ticket.description
    )

    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)

    return db_ticket