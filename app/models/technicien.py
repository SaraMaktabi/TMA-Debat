from sqlalchemy import Column, String, Integer, Boolean, JSON
from sqlalchemy.dialects.postgresql import UUID
from database import Base
import uuid

class Technicien(Base):
    __tablename__ = "techniciens"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nom = Column(String(100))
    prenom = Column(String(100))
    email = Column(String(255), unique=True)
    competences = Column(JSON)
    cv_texte = Column(String)
    disponibilite = Column(Boolean, default=True)
    charge_actuelle = Column(Integer, default=0)
