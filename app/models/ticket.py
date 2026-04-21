from sqlalchemy import Column, String, Integer, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import uuid
from datetime import datetime

class Ticket(Base):
    __tablename__ = "tickets"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    titre = Column(String(255), nullable=False)
    description = Column(String, nullable=False)
    priorite = Column(String(10))
    environnement = Column(String(20))
    application = Column(String(100))
    statut = Column(String(50), default="NOUVEAU")
    score_difficulte = Column(Integer, nullable=True)
    facteurs_score = Column(JSON, nullable=True)
    analyse_nlp = Column(JSON, nullable=True)
    technicien_assigne_id = Column(UUID(as_uuid=True), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
