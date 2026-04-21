from fastapi import APIRouter, Depends, HTTPException
from fastapi import Body
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.ticket import Ticket
from app.agents.scorer import calculer_score
import uuid
from datetime import datetime
from pydantic import BaseModel

# Définir un modèle Pydantic pour la requête
class TicketCreate(BaseModel):
    titre: str
    description: str
    priorite: str
    environnement: str
    application: str = ""

router = APIRouter()

@router.post("/")
async def creer_ticket(
    ticket_data: TicketCreate = Body(...),
    db: Session = Depends(get_db)
):
    """Créer un nouveau ticket"""
    ticket = Ticket(
        id=uuid.uuid4(),
        titre=ticket_data.titre,
        description=ticket_data.description,
        priorite=ticket_data.priorite,
        environnement=ticket_data.environnement,
        application=ticket_data.application,
        statut="NOUVEAU",
        created_at=datetime.utcnow()
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return {"id": str(ticket.id), "message": "Ticket créé avec succès"}

@router.post("/{ticket_id}/score")
async def get_score(ticket_id: str, db: Session = Depends(get_db)):
    """Calcule le score d'un ticket"""
    try:
        ticket_id_uuid = uuid.UUID(ticket_id)
    except ValueError:
        raise HTTPException(400, "ID invalide")
    
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id_uuid).first()
    if not ticket:
        raise HTTPException(404, "Ticket non trouvé")
    
    resultat = await calculer_score(
        ticket.titre, 
        ticket.description, 
        ticket.priorite, 
        ticket.environnement
    )
    ticket.score_difficulte = resultat["score"]
    ticket.facteurs_score = resultat["facteurs"]
    db.commit()
    return {"score": resultat["score"], "facteurs": resultat["facteurs"]}

@router.get("/")
async def list_tickets(db: Session = Depends(get_db)):
    """Liste tous les tickets"""
    tickets = db.query(Ticket).order_by(Ticket.created_at.desc()).all()
    return [
        {
            "id": str(t.id), 
            "titre": t.titre, 
            "priorite": t.priorite, 
            "statut": t.statut, 
            "score": t.score_difficulte,
            "created_at": t.created_at.isoformat() if t.created_at else None
        } 
        for t in tickets
    ]

@router.get("/{ticket_id}")
async def get_ticket(ticket_id: str, db: Session = Depends(get_db)):
    """Détail d'un ticket"""
    try:
        ticket_id_uuid = uuid.UUID(ticket_id)
    except ValueError:
        raise HTTPException(400, "ID invalide")
    
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id_uuid).first()
    if not ticket:
        raise HTTPException(404, "Ticket non trouvé")
    
    return {
        "id": str(ticket.id), 
        "titre": ticket.titre, 
        "description": ticket.description, 
        "priorite": ticket.priorite, 
        "environnement": ticket.environnement,
        "application": ticket.application,
        "statut": ticket.statut, 
        "score": ticket.score_difficulte, 
        "facteurs": ticket.facteurs_score,
        "technicien_assigne_id": str(ticket.technicien_assigne_id) if ticket.technicien_assigne_id else None,
        "created_at": ticket.created_at.isoformat() if ticket.created_at else None
    }