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
from datetime import datetime

router = APIRouter()

# Stockage temporaire des sessions en mémoire
sessions = {}

@router.post("/lancer/{ticket_id}")
async def lancer_debat(ticket_id: str, db: Session = Depends(get_db)):
    """Lance un débat entre 2 techniciens pour un ticket complexe"""
    
    try:
        ticket_id_uuid = uuid.UUID(ticket_id)
    except ValueError:
        raise HTTPException(400, "ID de ticket invalide")
    
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id_uuid).first()
    if not ticket:
        raise HTTPException(404, "Ticket non trouvé")
    
    # Vérifier que le ticket est complexe
    if ticket.score_difficulte and ticket.score_difficulte < 60:
        raise HTTPException(400, "Ticket trop simple pour un débat (score < 60)")
    
    # Récupérer les technologies du ticket
    technologies = ticket.analyse_nlp.get("technologies", []) if ticket.analyse_nlp else []
    
    # Recommander 2 techniciens
    analyse_nlp = ticket.analyse_nlp or {"technologies": [], "systemes_impactes": []}
    techniciens = recommander_techniciens(analyse_nlp, db, limit=2)
    
    if len(techniciens) < 2:
        raise HTTPException(400, "Pas assez de techniciens disponibles")
    
    # Créer la session temporaire
    session = DebatTemp(
        id=uuid.uuid4(),
        ticket_id=ticket.id,
        statut="EN_COURS",
        messages=[],
        created_at=datetime.utcnow()
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    
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
        "ticket_titre": ticket.titre,
        "techniciens": [
            {"id": str(t.id), "nom": f"{t.prenom} {t.nom}", "competences": t.competences}
            for t in techniciens
        ],
        "historique": orchestrateur.historique
    }

@router.get("/{session_id}")
async def get_debat(session_id: str, db: Session = Depends(get_db)):
    """Récupère l'état actuel du débat"""
    
    session = db.query(DebatTemp).filter(DebatTemp.id == session_id).first()
    if not session:
        raise HTTPException(404, "Session non trouvée")
    
    orchestrateur = sessions.get(session_id)
    
    return {
        "session_id": session_id,
        "statut": session.statut,
        "historique": session.messages,
        "proposition_juge": session.proposition_juge,
        "est_termine": orchestrateur.est_termine() if orchestrateur else False
    }

@router.post("/{session_id}/repondre")
async def repondre_debat(session_id: str, db: Session = Depends(get_db)):
    """Génère la réponse du prochain technicien"""
    
    if session_id not in sessions:
        raise HTTPException(404, "Session non trouvée")
    
    orchestrateur = sessions[session_id]
    session = db.query(DebatTemp).filter(DebatTemp.id == session_id).first()
    
    if orchestrateur.est_termine():
        return {
            "message": "Débat terminé",
            "historique": orchestrateur.historique,
            "est_termine": True
        }
    
    # Prochain agent
    prochain = orchestrateur.prochain_agent()
    message = await orchestrateur.generer_message(prochain)
    await orchestrateur.ajouter_message(prochain, message)
    
    # Incrémenter le tour si nécessaire
    orchestrateur.incrementer_tour()
    
    # Sauvegarder
    session.messages = orchestrateur.historique
    db.commit()
    
    return {
        "agent": f"{prochain.prenom} {prochain.nom}",
        "message": message,
        "tour": orchestrateur.tour_actuel,
        "historique": orchestrateur.historique,
        "est_termine": orchestrateur.est_termine()
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
    """Valide l'affectation du technicien (admin)"""
    
    session = db.query(DebatTemp).filter(DebatTemp.id == session_id).first()
    if not session:
        raise HTTPException(404, "Session non trouvée")
    
    technicien_id = decision.get("technicien_id")
    raison = decision.get("raison", "Validation automatique")
    
    # Mettre à jour le ticket
    ticket = db.query(Ticket).filter(Ticket.id == session.ticket_id).first()
    if not ticket:
        raise HTTPException(404, "Ticket non trouvé")
    
    ticket.technicien_assigne_id = technicien_id
    ticket.statut = "AFFECTE"
    
    session.statut = "VALIDE"
    session.proposition_juge = {
        **session.proposition_juge,
        "valide_par": decision.get("admin_nom", "admin"),
        "raison_override": raison,
        "date_validation": datetime.utcnow().isoformat()
    }
    db.commit()
    
    # Nettoyer la session mémoire
    if session_id in sessions:
        del sessions[session_id]
    
    return {"message": "Ticket affecté avec succès"}

@router.post("/{session_id}/annuler")
async def annuler_debat(session_id: str, db: Session = Depends(get_db)):
    """Annule le débat (admin)"""
    
    session = db.query(DebatTemp).filter(DebatTemp.id == session_id).first()
    if not session:
        raise HTTPException(404, "Session non trouvée")
    
    session.statut = "ANNULE"
    db.commit()
    
    # Nettoyer la session mémoire
    if session_id in sessions:
        del sessions[session_id]
    
    return {"message": "Débat annulé"}
