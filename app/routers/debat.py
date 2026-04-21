
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.ticket import Ticket
from app.models.technicien import Technicien
from app.models.debat_temp import DebatTemp
from app.agents.profil import recommander_techniciens
from app.agents.orchestrateur import OrchestrateurDebat
from app.agents.juge import evaluer_debat
import uuid

router = APIRouter()

# Stockage temporaire des sessions (en mémoire)
sessions = {}

@router.post("/lancer/{ticket_id}")
async def lancer_debat(ticket_id: str, db: Session = Depends(get_db)):
    """Lance un débat entre 2 techniciens pour un ticket"""
    
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(404, "Ticket non trouvé")
    
    # Récupérer les technologies du ticket
    technologies = ticket.analyse_nlp.get("technologies", []) if ticket.analyse_nlp else []
    
    # Recommander 2 techniciens
    techniciens = recommander_techniciens(technologies, db, limit=2)
    if len(techniciens) < 2:
        raise HTTPException(400, "Pas assez de techniciens disponibles")
    
    # Créer la session temporaire
    session = DebatTemp(
        id=uuid.uuid4(),
        ticket_id=ticket.id,
        statut="EN_COURS"
    )
    db.add(session)
    db.commit()
    
    # Créer l'orchestrateur
    orchestrateur = OrchestrateurDebat(ticket, techniciens)
    sessions[str(session.id)] = orchestrateur
    
    # Générer le premier message
    premier_agent = techniciens[0]
    message = await orchestrateur.generer_message(premier_agent)
    await orchestrateur.ajouter_message(premier_agent, message)
    
    # Sauvegarder
    session.messages = orchestrateur.historique
    db.commit()
    
    return {
        "session_id": str(session.id),
        "ticket_id": str(ticket.id),
        "techniciens": [
            {"id": str(t.id), "nom": f"{t.prenom} {t.nom}"} for t in techniciens
        ],
        "historique": orchestrateur.historique
    }

@router.post("/{session_id}/repondre")
async def repondre_debat(session_id: str, db: Session = Depends(get_db)):
    """Génère la réponse du prochain technicien"""
    
    if session_id not in sessions:
        raise HTTPException(404, "Session non trouvée")
    
    orchestrateur = sessions[session_id]
    session = db.query(DebatTemp).filter(DebatTemp.id == session_id).first()
    
    if orchestrateur.est_termine():
        return {"message": "Débat terminé", "historique": orchestrateur.historique}
    
    # Passer au tour suivant si nécessaire
    if len(orchestrateur.historique) > 0 and \
       orchestrateur.historique[-1]["agent_id"] == str(orchestrateur.techniciens[1].id):
        orchestrateur.tour_actuel += 1
    
    # Prochain agent
    prochain = orchestrateur.prochain_agent()
    message = await orchestrateur.generer_message(prochain)
    await orchestrateur.ajouter_message(prochain, message)
    
    # Sauvegarder
    session.messages = orchestrateur.historique
    db.commit()
    
    return {
        "agent": f"{prochain.prenom} {prochain.nom}",
        "message": message,
        "tour": orchestrateur.tour_actuel,
        "historique": orchestrateur.historique
    }

@router.post("/{session_id}/terminer")
async def terminer_debat(session_id: str, db: Session = Depends(get_db)):
    """Termine le débat et demande au juge de décider"""
    
    if session_id not in sessions:
        raise HTTPException(404, "Session non trouvée")
    
    orchestrateur = sessions[session_id]
    session = db.query(DebatTemp).filter(DebatTemp.id == session_id).first()
    
    # Demander au juge
    proposition = await evaluer_debat(
        orchestrateur.ticket,
        orchestrateur.historique,
        orchestrateur.techniciens
    )
    
    session.statut = "EN_ATTENTE_VALIDATION"
    session.proposition_juge = proposition
    db.commit()
    
    return {
        "proposition": proposition,
        "historique": orchestrateur.historique
    }

@router.post("/{session_id}/valider")
async def valider_decision(session_id: str, decision: dict, db: Session = Depends(get_db)):
    """Valide l'affectation du technicien"""
    
    session = db.query(DebatTemp).filter(DebatTemp.id == session_id).first()
    if not session:
        raise HTTPException(404, "Session non trouvée")
    
    technicien_id = decision.get("technicien_id")
    ticket = db.query(Ticket).filter(Ticket.id == session.ticket_id).first()
    
    ticket.technicien_assigne_id = technicien_id
    ticket.statut = "AFFECTE"
    session.statut = "VALIDE"
    db.commit()
    
    # Nettoyer la session mémoire
    if session_id in sessions:
        del sessions[session_id]
    
    return {"message": "Ticket affecté avec succès"}
