from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi import Body
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.ticket import Ticket
from app.agents.scorer import calculer_score
from app.agents.analyseur import analyser_technologies
from app.agents.profil import recommander_techniciens, recommander_techniciens_detaillees
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
    created_by_user_id: str | None = None

router = APIRouter()


def _normalize_ticket_status(statut: str | None) -> str:
    """Normalise les anciens statuts pour garder une logique cohérente côté produit."""
    if statut == "NOUVEAU":
        return "OUVERT"
    return statut or "OUVERT"

# Fonction d'analyse en arrière-plan (NLP + Score)
async def analyser_et_scorer_ticket_background(ticket_id: uuid.UUID, titre: str, description: str, priorite: str, environnement: str):
    from app.database import SessionLocal
    import asyncio
    db = SessionLocal()
    try:
        # Exécuter les 2 agents EN PARALLÈLE (pas séquentiellement)
        analyse, score_resultat = await asyncio.gather(
            analyser_technologies(titre, description),
            calculer_score(titre, description, priorite, environnement),
            return_exceptions=True  # Continue même si l'un échoue
        )
        
        # Vérifier si ce sont des exceptions
        if isinstance(analyse, Exception):
            print(f"⚠️ Erreur analyseur: {analyse}")
            analyse = {
                "technologies": ["general"],
                "type_incident": "autre",
                "systemes_impactes": [],
                "urgence_percue": "moyenne"
            }
        
        if isinstance(score_resultat, Exception):
            print(f"⚠️ Erreur scorer: {score_resultat}")
            score_resultat = {"score": 50, "facteurs": ["erreur_calcul"]}
        
        print(f"✅ Analyse NLP terminée pour ticket {ticket_id}")
        print(f"   Technologies détectées: {analyse.get('technologies', [])}")
        print(f"✅ Score calculé pour ticket {ticket_id}: {score_resultat.get('score', 0)}")
        
        # Mise à jour du ticket avec garantie que les deux champs sont remplis
        ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
        if ticket:
            ticket.analyse_nlp = analyse
            ticket.score_difficulte = score_resultat.get("score", 50)
            ticket.facteurs_score = score_resultat.get("facteurs", [])
            db.commit()
            print(f"✅ Ticket {ticket_id} mis à jour (analyse + score)")
    except Exception as e:
        print(f"❌ Erreur critique analyse/score: {e}")
    finally:
        db.close()

@router.post("")
@router.post("/")
async def creer_ticket(
    ticket_data: TicketCreate = Body(...),
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(get_db)
):
    """Créer un nouveau ticket avec analyse NLP + Score automatiques"""
    created_by_user_uuid = None
    if ticket_data.created_by_user_id:
        try:
            created_by_user_uuid = uuid.UUID(ticket_data.created_by_user_id)
        except ValueError:
            raise HTTPException(400, "created_by_user_id invalide")

    ticket = Ticket(
        id=uuid.uuid4(),
        titre=ticket_data.titre,
        description=ticket_data.description,
        priorite=ticket_data.priorite,
        environnement=ticket_data.environnement,
        application=ticket_data.application,
        statut="OUVERT",
        created_by_user_id=created_by_user_uuid,
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
    
    analyse_nlp = ticket.analyse_nlp or {
        "technologies": [],
        "systemes_impactes": [],
        "titre": ticket.titre,
        "description": ticket.description,
    }

    return recommander_techniciens_detaillees(analyse_nlp, db, limit=3)

@router.get("")
@router.get("/")
async def list_tickets(created_by_user_id: str | None = None, db: Session = Depends(get_db)):
    """Liste tous les tickets"""
    query = db.query(Ticket)

    if created_by_user_id:
        try:
            created_by_user_uuid = uuid.UUID(created_by_user_id)
        except ValueError:
            raise HTTPException(400, "created_by_user_id invalide")
        query = query.filter(Ticket.created_by_user_id == created_by_user_uuid)

    tickets = query.order_by(Ticket.created_at.desc()).all()
    return [
        {
            "id": str(t.id), 
            "titre": t.titre,
            "description": t.description,
            "priorite": t.priorite,
            "statut": _normalize_ticket_status(t.statut),
            "score": t.score_difficulte,
            "application": t.application,
            "environnement": t.environnement,
            "created_by_user_id": str(t.created_by_user_id) if t.created_by_user_id else None,
            "created_at": t.created_at.isoformat() if t.created_at else None
        } 
        for t in tickets
    ]

@router.get("/{ticket_id}")
async def get_ticket(
    ticket_id: str,
    requester_user_id: str | None = None,
    requester_role: str | None = None,
    db: Session = Depends(get_db),
):
    """Détail d'un ticket"""
    try:
        ticket_id_uuid = uuid.UUID(ticket_id)
    except ValueError:
        raise HTTPException(400, "ID invalide")
    
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id_uuid).first()
    if not ticket:
        raise HTTPException(404, "Ticket non trouvé")

    if requester_role != "Admin" and requester_user_id:
        try:
            requester_user_uuid = uuid.UUID(requester_user_id)
        except ValueError:
            raise HTTPException(400, "requester_user_id invalide")

        if ticket.created_by_user_id and ticket.created_by_user_id != requester_user_uuid:
            raise HTTPException(403, "Acces refuse a ce ticket")
    
    return {
        "id": str(ticket.id), 
        "titre": ticket.titre, 
        "description": ticket.description, 
        "priorite": ticket.priorite, 
        "environnement": ticket.environnement,
        "application": ticket.application,
        "statut": _normalize_ticket_status(ticket.statut), 
        "score": ticket.score_difficulte, 
        "facteurs": ticket.facteurs_score,
        "analyse_nlp": ticket.analyse_nlp,
        "technicien_assigne_id": str(ticket.technicien_assigne_id) if ticket.technicien_assigne_id else None,
        "created_by_user_id": str(ticket.created_by_user_id) if ticket.created_by_user_id else None,
        "created_at": ticket.created_at.isoformat() if ticket.created_at else None
    }

@router.post("/{ticket_id}/reanalyze")
async def reanalyze_ticket(ticket_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Relancer l'analyse NLP + Score sur un ticket existant"""
    try:
        ticket_id_uuid = uuid.UUID(ticket_id)
    except ValueError:
        raise HTTPException(400, "ID invalide")
    
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id_uuid).first()
    if not ticket:
        raise HTTPException(404, "Ticket non trouvé")
    
    # Lancer de nouveau l'analyse en arrière-plan
    background_tasks.add_task(
        analyser_et_scorer_ticket_background,
        ticket.id,
        ticket.titre,
        ticket.description,
        ticket.priorite,
        ticket.environnement
    )
    
    return {"message": f"Analyse relancée pour ticket {ticket_id}", "status": "processing"}

@router.post("/reanalyze-all/pending")
async def reanalyze_all_pending(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Relancer l'analyse sur TOUS les tickets sans analyse complète"""
    # Trouver les tickets sans analyse NLP
    pending_tickets = db.query(Ticket).filter(
        (Ticket.analyse_nlp == None) | (Ticket.score_difficulte == None)
    ).all()
    
    count = 0
    for ticket in pending_tickets:
        background_tasks.add_task(
            analyser_et_scorer_ticket_background,
            ticket.id,
            ticket.titre,
            ticket.description,
            ticket.priorite,
            ticket.environnement
        )
        count += 1
    
    return {
        "message": f"Analyse relancée pour {count} tickets en attente",
        "count": count,
        "status": "processing"
    }


@router.delete("/{ticket_id}", status_code=204)
async def delete_ticket(ticket_id: str, requester_role: str | None = None, db: Session = Depends(get_db)):
    """Supprime un ticket (admin uniquement)."""
    if requester_role != "Admin":
        raise HTTPException(403, "Seul un admin peut supprimer un ticket")

    try:
        ticket_id_uuid = uuid.UUID(ticket_id)
    except ValueError:
        raise HTTPException(400, "ID invalide")

    ticket = db.query(Ticket).filter(Ticket.id == ticket_id_uuid).first()
    if not ticket:
        raise HTTPException(404, "Ticket non trouvé")

    db.delete(ticket)
    db.commit()
