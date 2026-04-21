
from sqlalchemy.orm import Session
from app.models.technicien import Technicien
import math

def recommander_techniciens(technologies_ticket: list, db: Session, limit: int = 2) -> list:
    """
    Recommande les meilleurs techniciens basé sur les compétences
    Calcule un score de compatibilité pour chaque technicien
    
    Args:
        technologies_ticket: Liste des technologies détectées dans le ticket
        db: Session de base de données
        limit: Nombre de techniciens à retourner (défaut: 2)
    
    Returns:
        Liste des objets Technicien triés par score décroissant
    """
    
    # Récupérer tous les techniciens disponibles
    tous_techniciens = db.query(Technicien).filter(
        Technicien.disponibilite == True,
        Technicien.charge_actuelle < 5  # Moins de 5 tickets en cours
    ).all()
    
    if not technologies_ticket:
        # Si aucune technologie détectée, retourner les techniciens les moins chargés
        return sorted(tous_techniciens, key=lambda t: t.charge_actuelle)[:limit]
    
    # Calculer le score pour chaque technicien
    scores = []
    for tech in tous_techniciens:
        score = 0
        competences_tech = tech.competences or {}
        max_score_possible = len(technologies_ticket) * 50  # 50 points max par technologie
        
        for tech_demandee in technologies_ticket:
            # Recherche approximative (contient la technologie)
            meilleur_niveau = 0
            for comp, niveau in competences_tech.items():
                # Vérifier si la compétence correspond (insensible à la casse)
                if tech_demandee.lower() in comp.lower() or comp.lower() in tech_demandee.lower():
                    meilleur_niveau = max(meilleur_niveau, niveau)
            
            # Plus le niveau est élevé, plus le score est important
            if meilleur_niveau > 0:
                score += meilleur_niveau * 10  # 50 max par techno (niveau 5)
        
        # Normaliser le score entre 0 et 100
        if max_score_possible > 0:
            score_normalise = min(100, int((score / max_score_possible) * 100))
        else:
            score_normalise = 0
        
        # Bonus pour disponibilité (déjà filtré)
        # Malus pour charge actuelle (moins de charge = mieux)
        malus_charge = tech.charge_actuelle * 5
        score_final = max(0, score_normalise - malus_charge)
        
        scores.append({
            "technicien": tech,
            "score": score_final,
            "details": {
                "competences_match": score_normalise,
                "charge_actuelle": tech.charge_actuelle
            }
        })
    
    # Trier par score décroissant
    scores.sort(key=lambda x: x["score"], reverse=True)
    
    # Retourner les N meilleurs
    return [s["technicien"] for s in scores[:limit]]


def get_technicien_details(technicien_id: str, db: Session) -> dict:
    """
    Retourne les détails d'un technicien avec son score de performance
    """
    tech = db.query(Technicien).filter(Technicien.id == technicien_id).first()
    if not tech:
        return None
    
    return {
        "id": str(tech.id),
        "nom": f"{tech.prenom} {tech.nom}",
        "email": tech.email,
        "competences": tech.competences,
        "cv_texte": tech.cv_texte,
        "disponibilite": tech.disponibilite,
        "charge_actuelle": tech.charge_actuelle
    }


def calculer_compatibilite(technicien, technologies_ticket: list) -> int:
    """
    Calcule le score de compatibilité entre un technicien et un ticket
    """
    if not technologies_ticket:
        return 50  # Score neutre
    
    competences_tech = technicien.competences or {}
    score_total = 0
    
    for tech_demandee in technologies_ticket:
        meilleur_niveau = 0
        for comp, niveau in competences_tech.items():
            if tech_demandee.lower() in comp.lower() or comp.lower() in tech_demandee.lower():
                meilleur_niveau = max(meilleur_niveau, niveau)
        score_total += meilleur_niveau * 20  # 100 max par techno
    
    max_possible = len(technologies_ticket) * 100
    if max_possible > 0:
        return min(100, int((score_total / max_possible) * 100))
    return 0
