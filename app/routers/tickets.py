from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi import Body
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.ticket import Ticket
from app.agents.scorer import calculer_score
from app.agents.analyseur import analyser_technologies
from app.agents.profil import recommander_techniciens
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

# Fonction d'analyse en arrière-plan (NLP + Score)
async def analyser_et_scorer_ticket_background(ticket_id: uuid.UUID, titre: str, description: str, priorite: str, environnement: str):
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        # 1. Agent Analyseur (NLP)
        analyse = await analyser_technologies(titre, description)
        print(f"✅ Analyse NLP terminée pour ticket {ticket_id}")
        print(f"   Technologies détectées: {analyse.get('technologies', [])}")
        
        # 2. Agent Scorer (Score)
        score_resultat = await calculer_score(titre, description, priorite, environnement)
        print(f"✅ Score calculé pour ticket {ticket_id}: {score_resultat['score']}")
        
        # 3. Mise à jour du ticket
        ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
        if ticket:
            ticket.analyse_nlp = analyse
            ticket.score_difficulte = score_resultat["score"]
            ticket.facteurs_score = score_resultat["facteurs"]
            db.commit()
            print(f"✅ Ticket {ticket_id} mis à jour (analyse + score)")
    except Exception as e:
        print(f"❌ Erreur analyse/score: {e}")
    finally:
        db.close()

@router.post("/")
async def creer_ticket(
    ticket_data: TicketCreate = Body(...),
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(get_db)
):
    """Créer un nouveau ticket avec analyse NLP + Score automatiques"""
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
    
    # Lancer analyse + score en arrière-plan (automatique)
    if background_tasks:
        background_tasks.add_task(
            analyser_et_scorer_ticket_background, 
            ticket.id, 
            ticket.titre, 
            ticket.description,
            ticket.priorite,
            ticket.environnement
        )
    
    return {
        "id": str(ticket.id), 
        "message": "Ticket créé avec succès. Analyse et score en cours."
    }

@router.post("/{ticket_id}/score")
async def get_score(ticket_id: str, db: Session = Depends(get_db)):
    """Calcule le score d'un ticket (si besoin manuel)"""
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

@router.get("/{ticket_id}/recommandations")
async def get_recommandations(ticket_id: str, db: Session = Depends(get_db)):
    """Recommandations de techniciens basées sur l'analyse NLP"""
    try:
        ticket_id_uuid = uuid.UUID(ticket_id)
    except ValueError:
        raise HTTPException(400, "ID invalide")
    
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id_uuid).first()
    if not ticket:
        raise HTTPException(404, "Ticket non trouvé")
    
    # Utiliser l'analyse NLP complète
    analyse_nlp = ticket.analyse_nlp or {"technologies": [], "systemes_impactes": []}
    techniciens = recommander_techniciens(analyse_nlp, db, limit=2)
    
    # Calculer le score de compatibilité
    technologies = analyse_nlp.get("technologies", [])
    
    return [
        {
            "id": str(t.id),
            "nom": f"{t.prenom} {t.nom}",
            "email": t.email,
            "competences": t.competences,
            "score_compatibilite": min(100, sum(t.competences.get(tech, 0) for tech in technologies) * 10)
        }
        for t in techniciens
    ]

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
        "analyse_nlp": ticket.analyse_nlp,
        "technicien_assigne_id": str(ticket.technicien_assigne_id) if ticket.technicien_assigne_id else None,
        "created_at": ticket.created_at.isoformat() if ticket.created_at else None
    }
