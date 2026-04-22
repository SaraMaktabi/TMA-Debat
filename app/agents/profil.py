from sqlalchemy.orm import Session
from app.models.technicien import Technicien


def _normaliser_analyse(analyse_nlp):
    if isinstance(analyse_nlp, list):
        return {
            "technologies": analyse_nlp,
            "systemes_impactes": [],
            "titre": "",
            "description": "",
        }

    if not isinstance(analyse_nlp, dict):
        return {
            "technologies": [],
            "systemes_impactes": [],
            "titre": "",
            "description": "",
        }

    return {
        "technologies": analyse_nlp.get("technologies", []) or [],
        "systemes_impactes": analyse_nlp.get("systemes_impactes", []) or [],
        "titre": analyse_nlp.get("titre", "") or "",
        "description": analyse_nlp.get("description", "") or "",
    }


def _deduire_tags_texte(texte: str):
    texte = (texte or "").lower()
    technologies = []
    systemes_impactes = []

    if any(word in texte for word in ["front", "interface", "theme", "react", "css", "ui", "mobile", "web"]):
        technologies.append("Frontend")
        systemes_impactes.append("frontend")
    if any(word in texte for word in ["backend", "api", "python", "fastapi", "node", "java", "serveur"]):
        technologies.append("API")
        systemes_impactes.append("backend")
    if any(word in texte for word in ["postgresql", "sql", "base de donnee", "bdd", "database"]):
        technologies.append("PostgreSQL")
        systemes_impactes.append("database")
    if any(word in texte for word in ["docker", "deploiement", "container", "infra", "devops"]):
        technologies.append("Docker")

    return {
        "technologies": list(dict.fromkeys(technologies)),
        "systemes_impactes": list(dict.fromkeys(systemes_impactes)),
    }


def _calculer_score_technicien(competences_tech: dict, technologies: list[str], systemes_impactes: list[str]):
    score = 0
    raisons = []

    for tech_demandee in technologies:
        tech_lower = tech_demandee.lower()
        for comp, niveau in competences_tech.items():
            comp_lower = str(comp).lower()
            if tech_lower in comp_lower or comp_lower in tech_lower:
                gain = int(niveau) * 10
                score += gain
                raisons.append(f"Match technologie: {tech_demandee} (+{gain})")

    for systeme in systemes_impactes:
        systeme_lower = systeme.lower()
        if systeme_lower == "frontend" and any(c in competences_tech for c in ["React", "Vue", "Angular", "Tailwind", "TypeScript"]):
            score += 30
            raisons.append("Expert frontend (+30)")
        if systeme_lower == "backend" and any(c in competences_tech for c in ["Python", "FastAPI", "Node.js", "Java"]):
            score += 30
            raisons.append("Expert backend (+30)")
        if systeme_lower == "database" and any(c in competences_tech for c in ["PostgreSQL", "SQL", "Oracle"]):
            score += 30
            raisons.append("Expert base de donnees (+30)")

    return min(100, score), raisons


def _extraire_top_competences(competences_tech: dict, limit: int = 4):
    if not competences_tech:
        return []
    try:
        items = sorted(competences_tech.items(), key=lambda item: item[1], reverse=True)
    except Exception:
        items = list(competences_tech.items())
    return [f"{comp} ({niveau})" for comp, niveau in items[:limit]]


def recommander_techniciens(analyse_nlp, db: Session, limit=2):
    """Recommande des techniciens basé sur technologies ET systemes_impactes."""

    normalise = _normaliser_analyse(analyse_nlp)
    technologies = normalise["technologies"]
    systemes_impactes = normalise["systemes_impactes"]

    if not technologies and not systemes_impactes:
        heuristiques = _deduire_tags_texte(f"{normalise['titre']} {normalise['description']}")
        technologies = heuristiques["technologies"]
        systemes_impactes = heuristiques["systemes_impactes"]

    tous_techniciens = db.query(Technicien).filter(
        Technicien.disponibilite == True,
        Technicien.charge_actuelle < 5
    ).all()

    scores = []
    for tech in tous_techniciens:
        competences_tech = tech.competences or {}
        score, raisons = _calculer_score_technicien(competences_tech, technologies, systemes_impactes)
        scores.append({"technicien": tech, "score": score, "raisons": raisons})

    scores.sort(key=lambda x: x["score"], reverse=True)
    return [s["technicien"] for s in scores[:limit]]


def recommander_techniciens_detaillees(analyse_nlp, db: Session, limit=3):
    """Retourne les techniciens recommandés avec score de compatibilite et raisons."""

    normalise = _normaliser_analyse(analyse_nlp)
    technologies = normalise["technologies"]
    systemes_impactes = normalise["systemes_impactes"]

    if not technologies and not systemes_impactes:
        heuristiques = _deduire_tags_texte(f"{normalise['titre']} {normalise['description']}")
        technologies = heuristiques["technologies"]
        systemes_impactes = heuristiques["systemes_impactes"]

    tous_techniciens = db.query(Technicien).filter(
        Technicien.disponibilite == True,
        Technicien.charge_actuelle < 5
    ).all()

    scores = []
    for tech in tous_techniciens:
        competences_tech = tech.competences or {}
        score, raisons = _calculer_score_technicien(competences_tech, technologies, systemes_impactes)
        scores.append({
            "technicien": tech,
            "score": score,
            "raisons": raisons,
            "top_competences": _extraire_top_competences(competences_tech),
        })

    scores.sort(key=lambda x: x["score"], reverse=True)

    return [
        {
            "id": str(item["technicien"].id),
            "nom": f"{item['technicien'].prenom} {item['technicien'].nom}",
            "email": item["technicien"].email,
            "competences": item["technicien"].competences,
            "score_compatibilite": item["score"],
            "raisons": item["raisons"],
            "top_competences": item["top_competences"],
            "disponibilite": item["technicien"].disponibilite,
            "charge_actuelle": item["technicien"].charge_actuelle,
        }
        for item in scores[:limit]
    ]
