from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.ticket import Ticket
from app.models.technicien import Technicien
from app.models.debat_temp import DebatTemp
from app.agents.profil import recommander_techniciens
from app.agents.orchestrateur import OrchestrateurDebat
from app.agents.orchestrateur_hybride import OrchestrateurHybride
from app.agents.juge_independant import evaluer_debat
import uuid
from datetime import datetime

router = APIRouter()

# ============================================
# SESSIONS EN MÉMOIRE (pour accès rapide)
# ============================================
sessions_classiques = {}
sessions_hybrides = {}


# ============================================
# ROUTES CLASSIQUES (GPT-4o-mini uniquement)
# ============================================

@router.post("/lancer/{ticket_id}")
async def lancer_debat(ticket_id: str, db: Session = Depends(get_db)):
    """Lance un débat classique (GPT-4o-mini pour les deux techniciens)"""
    
    try:
        ticket_id_uuid = uuid.UUID(ticket_id)
    except ValueError:
        raise HTTPException(400, "ID de ticket invalide")
    
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id_uuid).first()
    if not ticket:
        raise HTTPException(404, "Ticket non trouvé")
    
    if ticket.score_difficulte and ticket.score_difficulte < 60:
        raise HTTPException(400, "Ticket trop simple pour un débat (score < 60)")
    
    analyse_nlp = ticket.analyse_nlp or {"technologies": [], "systemes_impactes": []}
    techniciens = recommander_techniciens(analyse_nlp, db, limit=2)
    
    if len(techniciens) < 2:
        raise HTTPException(400, "Pas assez de techniciens disponibles")
    
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
    
    orchestrateur = OrchestrateurDebat(ticket, techniciens)
    sessions_classiques[str(session.id)] = orchestrateur
    
    premier_agent = techniciens[0]
    message = await orchestrateur.generer_message(premier_agent)
    await orchestrateur.ajouter_message(premier_agent, message)
    
    session.messages = orchestrateur.historique
    db.commit()
    
    return {
        "session_id": str(session.id),
        "type": "classique (GPT-4o-mini)",
        "ticket_id": str(ticket.id),
        "ticket_titre": ticket.titre,
        "techniciens": [
            {"id": str(t.id), "nom": f"{t.prenom} {t.nom}", "llm": "GPT-4o-mini"}
            for t in techniciens
        ],
        "historique": orchestrateur.historique
    }


@router.get("/{session_id}")
async def get_debat(session_id: str, db: Session = Depends(get_db)):
    """Récupère l'état du débat (classique ou hybride)"""
    
    session = db.query(DebatTemp).filter(DebatTemp.id == session_id).first()
    if not session:
        raise HTTPException(404, "Session non trouvée")
    
    orchestrateur = sessions_classiques.get(session_id) or sessions_hybrides.get(session_id)
    type_debat = "classique" if session_id in sessions_classiques else "hybride"
    
    return {
        "session_id": session_id,
        "type": type_debat,
        "statut": session.statut,
        "historique": session.messages,
        "messages_interactifs": getattr(session, 'messages_interactifs', []),
        "proposition_juge": session.proposition_juge,
        "decision_finale": getattr(session, 'decision_finale', None),
        "est_termine": orchestrateur.est_termine() if orchestrateur else False
    }


@router.post("/{session_id}/repondre")
async def repondre_debat(session_id: str, db: Session = Depends(get_db)):
    """Génère la réponse du prochain technicien (session classique)"""
    
    orchestrateur = sessions_classiques.get(session_id)
    if not orchestrateur:
        raise HTTPException(404, "Session classique non trouvée")
    
    session = db.query(DebatTemp).filter(DebatTemp.id == session_id).first()
    if not session:
        raise HTTPException(404, "Session en base non trouvée")
    
    if orchestrateur.est_termine():
        return {"message": "Débat terminé", "historique": orchestrateur.historique}
    
    prochain = orchestrateur.prochain_agent()
    message = await orchestrateur.generer_message(prochain)
    await orchestrateur.ajouter_message(prochain, message)
    
    orchestrateur.incrementer_tour()
    
    session.messages = orchestrateur.historique
    db.commit()
    
    return {
        "agent": f"{prochain.prenom} {prochain.nom}",
        "llm": "GPT-4o-mini",
        "message": message,
        "tour": orchestrateur.tour_actuel,
        "historique": orchestrateur.historique,
        "est_termine": orchestrateur.est_termine()
    }


@router.post("/{session_id}/terminer")
async def terminer_debat(session_id: str, db: Session = Depends(get_db)):
    """Termine le débat classique et demande au juge"""
    
    orchestrateur = sessions_classiques.get(session_id)
    if not orchestrateur:
        raise HTTPException(404, "Session classique non trouvée")
    
    session = db.query(DebatTemp).filter(DebatTemp.id == session_id).first()
    if not session:
        raise HTTPException(404, "Session en base non trouvée")
    
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
    """Valide l'affectation (session classique)"""
    
    session = db.query(DebatTemp).filter(DebatTemp.id == session_id).first()
    if not session:
        raise HTTPException(404, "Session non trouvée")
    
    technicien_id = decision.get("technicien_id")
    raison = decision.get("raison", "Validation automatique")
    
    ticket = db.query(Ticket).filter(Ticket.id == session.ticket_id).first()
    if not ticket:
        raise HTTPException(404, "Ticket non trouvé")
    
    ticket.technicien_assigne_id = technicien_id
    ticket.statut = "AFFECTE"
    
    session.statut = "VALIDE"
    session.proposition_juge = {
        **(session.proposition_juge or {}),
        "valide_par": decision.get("admin_nom", "admin"),
        "raison_override": raison,
        "date_validation": datetime.utcnow().isoformat()
    }
    db.commit()
    
    if session_id in sessions_classiques:
        del sessions_classiques[session_id]
    
    return {"message": "Ticket affecté avec succès"}


@router.post("/{session_id}/annuler")
async def annuler_debat(session_id: str, db: Session = Depends(get_db)):
    """Annule le débat (session classique)"""
    
    session = db.query(DebatTemp).filter(DebatTemp.id == session_id).first()
    if not session:
        raise HTTPException(404, "Session non trouvée")
    
    session.statut = "ANNULE"
    db.commit()
    
    if session_id in sessions_classiques:
        del sessions_classiques[session_id]
    
    return {"message": "Débat annulé"}


# ============================================
# ROUTES HYBRIDES (GPT-4o-mini + Qwen3-8B)
# ============================================

@router.post("/lancer-hybride/{ticket_id}")
async def lancer_debat_hybride(ticket_id: str, db: Session = Depends(get_db)):
    """Lance un débat HYBRIDE (GPT-4o-mini vs Qwen3-8B local)"""
    
    try:
        ticket_id_uuid = uuid.UUID(ticket_id)
    except ValueError:
        raise HTTPException(400, "ID de ticket invalide")
    
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id_uuid).first()
    if not ticket:
        raise HTTPException(404, "Ticket non trouvé")
    
    if ticket.score_difficulte and ticket.score_difficulte < 60:
        raise HTTPException(400, "Ticket trop simple pour un débat (score < 60)")
    
    analyse_nlp = ticket.analyse_nlp or {"technologies": [], "systemes_impactes": []}
    techniciens = recommander_techniciens(analyse_nlp, db, limit=2)
    
    if len(techniciens) < 2:
        raise HTTPException(400, "Pas assez de techniciens disponibles")
    
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
    
    orchestrateur = OrchestrateurHybride(ticket, techniciens)
    sessions_hybrides[str(session.id)] = orchestrateur
    
    premier_agent = techniciens[0]
    message = await orchestrateur.generer_message(premier_agent)
    await orchestrateur.ajouter_message(premier_agent, message)
    
    session.messages = orchestrateur.historique
    db.commit()
    
    return {
        "session_id": str(session.id),
        "type": "hybride (GPT-4o-mini + Qwen3-8B)",
        "ticket_id": str(ticket.id),
        "ticket_titre": ticket.titre,
        "techniciens": [
            {"id": str(t.id), "nom": f"{t.prenom} {t.nom}", "llm": "GPT-4o-mini" if i == 0 else "Qwen3-8B"}
            for i, t in enumerate(techniciens)
        ],
        "historique": orchestrateur.historique
    }


@router.get("/hybride/{session_id}")
async def get_debat_hybride(session_id: str, db: Session = Depends(get_db)):
    """Récupère l'état du débat hybride"""
    
    session = db.query(DebatTemp).filter(DebatTemp.id == session_id).first()
    if not session:
        raise HTTPException(404, "Session non trouvée")
    
    orchestrateur = sessions_hybrides.get(session_id)
    
    return {
        "session_id": session_id,
        "type": "hybride",
        "statut": session.statut,
        "historique": session.messages,
        "messages_interactifs": getattr(session, 'messages_interactifs', []),
        "proposition_juge": session.proposition_juge,
        "decision_finale": getattr(session, 'decision_finale', None),
        "est_termine": orchestrateur.est_termine() if orchestrateur else False
    }


@router.post("/hybride/{session_id}/repondre")
async def repondre_debat_hybride(session_id: str, db: Session = Depends(get_db)):
    """Génère la réponse du prochain technicien (version hybride)"""
    
    orchestrateur = sessions_hybrides.get(session_id)
    if not orchestrateur:
        raise HTTPException(404, "Session hybride non trouvée")
    
    session = db.query(DebatTemp).filter(DebatTemp.id == session_id).first()
    if not session:
        raise HTTPException(404, "Session en base non trouvée")
    
    if orchestrateur.est_termine():
        return {"message": "Débat terminé", "historique": orchestrateur.historique}
    
    prochain = orchestrateur.prochain_agent()
    message = await orchestrateur.generer_message(prochain)
    await orchestrateur.ajouter_message(prochain, message)
    
    orchestrateur.incrementer_tour()
    
    session.messages = orchestrateur.historique
    db.commit()
    
    return {
        "agent": f"{prochain.prenom} {prochain.nom}",
        "llm": "GPT-4o-mini" if prochain.prenom == "Sophie" else "Qwen3-8B",
        "message": message,
        "tour": orchestrateur.tour_actuel,
        "historique": orchestrateur.historique,
        "est_termine": orchestrateur.est_termine()
    }


@router.post("/hybride/{session_id}/terminer")
async def terminer_debat_hybride(session_id: str, db: Session = Depends(get_db)):
    """Termine le débat hybride et demande au juge de décider"""
    
    orchestrateur = sessions_hybrides.get(session_id)
    if not orchestrateur:
        raise HTTPException(404, "Session hybride non trouvée")
    
    session = db.query(DebatTemp).filter(DebatTemp.id == session_id).first()
    if not session:
        raise HTTPException(404, "Session en base non trouvée")
    
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


@router.post("/hybride/{session_id}/valider")
async def valider_debat_hybride(session_id: str, decision: dict, db: Session = Depends(get_db)):
    """Valide l'affectation pour un débat hybride"""
    
    session = db.query(DebatTemp).filter(DebatTemp.id == session_id).first()
    if not session:
        raise HTTPException(404, "Session non trouvée")
    
    technicien_id = decision.get("technicien_id")
    raison = decision.get("raison", "Validation automatique")
    
    ticket = db.query(Ticket).filter(Ticket.id == session.ticket_id).first()
    if not ticket:
        raise HTTPException(404, "Ticket non trouvé")
    
    ticket.technicien_assigne_id = technicien_id
    ticket.statut = "AFFECTE"
    
    session.statut = "VALIDE"
    session.proposition_juge = {
        **(session.proposition_juge or {}),
        "valide_par": decision.get("admin_nom", "admin"),
        "raison_override": raison,
        "date_validation": datetime.utcnow().isoformat()
    }
    db.commit()
    
    if session_id in sessions_hybrides:
        del sessions_hybrides[session_id]
    
    return {"message": "Ticket affecté avec succès (débat hybride)"}


@router.post("/hybride/{session_id}/annuler")
async def annuler_debat_hybride(session_id: str, db: Session = Depends(get_db)):
    """Annule le débat hybride"""
    
    session = db.query(DebatTemp).filter(DebatTemp.id == session_id).first()
    if not session:
        raise HTTPException(404, "Session non trouvée")
    
    session.statut = "ANNULE"
    db.commit()
    
    if session_id in sessions_hybrides:
        del sessions_hybrides[session_id]
    
    return {"message": "Débat hybride annulé"}


# ============================================
# ROUTES POUR DÉBAT INTERACTIF (Admin peut poser des questions)
# ============================================

@router.post("/hybride/{session_id}/question")
async def poser_question_admin(
    session_id: str, 
    question: dict, 
    db: Session = Depends(get_db)
):
    """L'admin pose une question aux deux techniciens"""
    
    orchestrateur = sessions_hybrides.get(session_id)
    if not orchestrateur:
        raise HTTPException(404, "Session hybride non trouvée")
    
    session = db.query(DebatTemp).filter(DebatTemp.id == session_id).first()
    if not session:
        raise HTTPException(404, "Session en base non trouvée")
    
    texte_question = question.get("question", "")
    
    # Récupérer ou initialiser messages_interactifs
    messages_interactifs = []
    if hasattr(session, 'messages_interactifs') and session.messages_interactifs:
        messages_interactifs = session.messages_interactifs
    
    messages_interactifs.append({
        "type": "admin_question",
        "agent_nom": "Administrateur",
        "contenu": texte_question,
        "timestamp": datetime.utcnow().isoformat()
    })
    
    # Les deux agents répondent à la question
    reponses = []
    
    for agent in orchestrateur.techniciens:
        reponse = await orchestrateur.generer_message(agent, question_context=texte_question)
        reponse_msg = {
            "type": "agent_reponse",
            "agent_id": str(agent.id),
            "agent_nom": f"{agent.prenom} {agent.nom}",
            "contenu": reponse,
            "llm": "GPT-4o-mini" if agent.prenom == "Sophie" else "Qwen3-8B",
            "timestamp": datetime.utcnow().isoformat()
        }
        messages_interactifs.append(reponse_msg)
        reponses.append(reponse_msg)
        
        await orchestrateur.ajouter_message(agent, f"[RÉPONSE À QUESTION] {reponse}")
    
    session.messages_interactifs = messages_interactifs
    session.messages = orchestrateur.historique
    db.commit()
    
    return {
        "question": texte_question,
        "reponses": reponses
    }


@router.post("/hybride/{session_id}/continue")
async def continuer_debat(session_id: str, db: Session = Depends(get_db)):
    """Admin demande aux agents de continuer le débat normalement"""
    
    orchestrateur = sessions_hybrides.get(session_id)
    if not orchestrateur:
        raise HTTPException(404, "Session hybride non trouvée")
    
    return await repondre_debat_hybride(session_id, db)


@router.post("/hybride/{session_id}/juge")
async def demander_juge(session_id: str, db: Session = Depends(get_db)):
    """Admin demande au juge de trancher (analyse TOUT l'historique)"""
    
    orchestrateur = sessions_hybrides.get(session_id)
    if not orchestrateur:
        raise HTTPException(404, "Session hybride non trouvée")
    
    session = db.query(DebatTemp).filter(DebatTemp.id == session_id).first()
    if not session:
        raise HTTPException(404, "Session en base non trouvée")
    
    historique_complet = (orchestrateur.historique or [])
    if hasattr(session, 'messages_interactifs') and session.messages_interactifs:
        historique_complet = historique_complet + session.messages_interactifs
    
    proposition = await evaluer_debat(
        orchestrateur.ticket,
        historique_complet,
        orchestrateur.techniciens
    )
    
    session.statut = "EN_ATTENTE_VALIDATION"
    session.proposition_juge = proposition
    db.commit()
    
    return {
        "proposition": proposition,
        "historique_complet": historique_complet
    }


@router.post("/hybride/{session_id}/valider_final")
async def valider_final(session_id: str, decision: dict, db: Session = Depends(get_db)):
    """Validation finale avec STOCKAGE DÉFINITIF en base"""
    
    session = db.query(DebatTemp).filter(DebatTemp.id == session_id).first()
    if not session:
        raise HTTPException(404, "Session non trouvée")
    
    technicien_id = decision.get("technicien_id")
    technicien_nom = decision.get("technicien_nom", "")
    raison = decision.get("raison", "Validation automatique")
    admin_nom = decision.get("admin_nom", "admin")
    
    ticket = db.query(Ticket).filter(Ticket.id == session.ticket_id).first()
    if not ticket:
        raise HTTPException(404, "Ticket non trouvé")
    
    historique_complet = {
        "messages_auto": session.messages,
        "messages_interactifs": session.messages_interactifs if hasattr(session, 'messages_interactifs') else [],
        "proposition_juge": session.proposition_juge
    }
    
    decision_finale = {
        "technicien_assigne_id": technicien_id,
        "technicien_nom": technicien_nom,
        "raison": raison,
        "valide_par": admin_nom,
        "date_validation": datetime.utcnow().isoformat(),
        "historique_complet": historique_complet
    }
    
    session.decision_finale = decision_finale
    session.statut = "VALIDE"
    ticket.technicien_assigne_id = technicien_id
    ticket.statut = "AFFECTE"
    
    db.commit()
    
    if session_id in sessions_hybrides:
        del sessions_hybrides[session_id]
    
    return {
        "message": "Ticket affecté avec succès - Décision finalisée et stockée",
        "decision_finale": decision_finale
    }
