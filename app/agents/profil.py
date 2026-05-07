from collections import Counter
import unicodedata

from sqlalchemy.orm import Session

from app.models.ticket import Ticket
from app.models.technicien import Technicien


def _est_admin(tech: Technicien) -> bool:
    competences = tech.competences if isinstance(tech.competences, dict) else {}
    meta = competences.get("_meta", {}) if isinstance(competences.get("_meta", {}), dict) else {}
    role = str(meta.get("role", "")).strip().lower()
    return role == "admin"


def _est_profil_technicien(tech: Technicien) -> bool:
    competences = tech.competences if isinstance(tech.competences, dict) else {}
    meta = competences.get("_meta", {}) if isinstance(competences.get("_meta", {}), dict) else {}
    role = str(meta.get("role", "")).strip().lower()

    # Les profils de recommandation doivent etre des techniciens explicites.
    return role in {"technician", "technicien"}


def _normaliser_terme(value: str) -> str:
    text = str(value or "").strip().lower()
    text = "".join(
        char
        for char in unicodedata.normalize("NFKD", text)
        if not unicodedata.combining(char)
    )
    text = text.replace("-", " ").replace("_", " ")
    return " ".join(text.split())


def _canonical_skill(value: str) -> str:
    token = _normaliser_terme(value)

    alias_groups: dict[str, tuple[str, ...]] = {
        "sql": ("sql", "postgres", "postgresql", "postgress", "mysql", "oracle", "database", "bdd", "base de donnee"),
        "frontend": ("frontend", "front end", "react", "vue", "angular", "html", "css", "javascript", "typescript", "ui"),
        "api": ("api", "rest", "backend", "microservice", "node js", "node", "express", "fastapi", "django", "flask", "spring"),
        "python": ("python",),
        "docker": ("docker", "kubernetes", "container"),
        "security": ("securite", "security", "cyber", "siem", "soc"),
    }

    for canonical, aliases in alias_groups.items():
        if any(alias in token for alias in aliases):
            return canonical
    return token


def _matches_required_skill(required: str, skill: str) -> bool:
    required_token = _canonical_skill(required)
    skill_token = _canonical_skill(skill)
    return (
        required_token == skill_token
        or required_token in skill_token
        or skill_token in required_token
    )


def _extraire_competences_tech(competences_tech: dict) -> dict:
    if not isinstance(competences_tech, dict):
        return {}

    competences_filtrees = {}
    for nom, niveau in competences_tech.items():
        if str(nom).startswith("_"):
            continue
        if isinstance(niveau, (int, float)):
            competences_filtrees[str(nom)] = int(niveau)
            continue
        if isinstance(niveau, str) and niveau.strip().isdigit():
            competences_filtrees[str(nom)] = int(niveau.strip())

    return competences_filtrees


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


def _normaliser_tags(tags: list[str]) -> list[str]:
    normalises: list[str] = []
    for tag in tags or []:
        if not isinstance(tag, str):
            continue
        value = tag.strip().lower()
        if value:
            normalises.append(value)
    return list(dict.fromkeys(normalises))


def _is_resolved_status(status: str | None) -> bool:
    value = str(status or "").strip().upper()
    return value in {"RESOLU", "RÉSOLU", "RESOLVED"}


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


def _charger_historique_techniciens(techniciens: list[Technicien], db: Session) -> dict[str, dict]:
    ids = [tech.id for tech in techniciens if getattr(tech, "id", None) is not None]
    if not ids:
        return {}

    tickets = (
        db.query(Ticket)
        .filter(Ticket.technicien_assigne_id.in_(ids))
        .all()
    )

    by_technicien: dict[str, dict] = {
        str(tech.id): {
            "resolved_count": 0,
            "all_assigned_count": 0,
            "technologies": Counter(),
            "systemes": Counter(),
            "avg_score_difficulte": 0.0,
        }
        for tech in techniciens
    }

    score_sums: dict[str, float] = {str(tech.id): 0.0 for tech in techniciens}
    score_counts: dict[str, int] = {str(tech.id): 0 for tech in techniciens}

    for ticket in tickets:
        tech_id = str(ticket.technicien_assigne_id) if ticket.technicien_assigne_id else None
        if not tech_id or tech_id not in by_technicien:
            continue

        stats = by_technicien[tech_id]
        stats["all_assigned_count"] += 1

        if not _is_resolved_status(ticket.statut):
            continue

        stats["resolved_count"] += 1
        analyse = _normaliser_analyse(ticket.analyse_nlp or {})
        if not analyse["technologies"] and not analyse["systemes_impactes"]:
            deduits = _deduire_tags_texte(f"{ticket.titre or ''} {ticket.description or ''}")
            analyse = {
                **analyse,
                "technologies": deduits["technologies"],
                "systemes_impactes": deduits["systemes_impactes"],
            }

        for tag in _normaliser_tags(analyse["technologies"]):
            stats["technologies"][tag] += 1
        for sys in _normaliser_tags(analyse["systemes_impactes"]):
            stats["systemes"][sys] += 1

        if isinstance(ticket.score_difficulte, (int, float)):
            score_sums[tech_id] += float(ticket.score_difficulte)
            score_counts[tech_id] += 1

    for tech_id, stats in by_technicien.items():
        if score_counts[tech_id] > 0:
            stats["avg_score_difficulte"] = round(score_sums[tech_id] / score_counts[tech_id], 1)

    return by_technicien


def _calculer_score_technicien(
    tech: Technicien,
    competences_tech: dict,
    technologies: list[str],
    systemes_impactes: list[str],
    historique: dict | None,
):
    score = 0.0
    raisons = []
    competences_utiles = _extraire_competences_tech(competences_tech)
    technologies_norm = _normaliser_tags(technologies)
    systemes_norm = _normaliser_tags(systemes_impactes)

    skill_score = 0.0
    for tech_demandee in technologies_norm:
        for comp, niveau in competences_utiles.items():
            if _matches_required_skill(tech_demandee, str(comp)):
                gain = min(12.0, max(2.0, float(niveau) * 2.2))
                skill_score += gain
                raisons.append(f"Compétence alignée: {comp} (niveau {niveau}) (+{int(round(gain))})")

    if any(sys == "frontend" for sys in systemes_norm) and any(_matches_required_skill("frontend", c) for c in competences_utiles):
        skill_score += 8
        raisons.append("Compétences frontend pertinentes (+8)")
    if any(sys in {"backend", "api"} for sys in systemes_norm) and any(_matches_required_skill("api", c) or _matches_required_skill("python", c) for c in competences_utiles):
        skill_score += 8
        raisons.append("Compétences backend/API pertinentes (+8)")
    if any(sys in {"database", "bdd"} for sys in systemes_norm) and any(_matches_required_skill("sql", c) for c in competences_utiles):
        skill_score += 6
        raisons.append("Compétences base de données pertinentes (+6)")

    score += min(55.0, skill_score)

    historique = historique or {
        "resolved_count": 0,
        "all_assigned_count": 0,
        "technologies": Counter(),
        "systemes": Counter(),
        "avg_score_difficulte": 0.0,
    }

    resolved_count = int(historique.get("resolved_count", 0) or 0)
    all_assigned_count = int(historique.get("all_assigned_count", 0) or 0)
    hist_technologies: Counter = historique.get("technologies", Counter())
    hist_systemes: Counter = historique.get("systemes", Counter())

    if technologies_norm:
        techno_hits = sum(hist_technologies.get(tag, 0) for tag in technologies_norm)
        tech_ratio = min(1.0, techno_hits / max(1, len(technologies_norm) * 2))
    else:
        tech_ratio = 0.0

    if systemes_norm:
        system_hits = sum(hist_systemes.get(tag, 0) for tag in systemes_norm)
        system_ratio = min(1.0, system_hits / max(1, len(systemes_norm) * 2))
    else:
        system_ratio = 0.0

    history_match_score = (tech_ratio * 12.0) + (system_ratio * 8.0)
    if history_match_score > 0:
        score += history_match_score
        raisons.append(
            f"Historique pertinent: techno {int(round(tech_ratio * 100))}% / systèmes {int(round(system_ratio * 100))}% (+{int(round(history_match_score))})"
        )

    volume_score = min(10.0, resolved_count * 1.2)
    if volume_score > 0:
        score += volume_score
        raisons.append(f"Expérience tickets résolus: {resolved_count} (+{int(round(volume_score))})")

    if all_assigned_count > 0:
        resolution_rate = resolved_count / max(1, all_assigned_count)
        rate_score = max(0.0, (resolution_rate - 0.4) * 10)
        if rate_score > 0:
            score += min(5.0, rate_score)
            raisons.append(f"Taux de résolution: {int(round(resolution_rate * 100))}% (+{int(round(min(5.0, rate_score)))})")

    charge_penalty = min(12.0, float(getattr(tech, "charge_actuelle", 0) or 0) * 2.5)
    if charge_penalty > 0:
        score -= charge_penalty
        raisons.append(f"Charge actuelle élevée ({int(getattr(tech, 'charge_actuelle', 0) or 0)}) (-{int(round(charge_penalty))})")

    return max(0, min(100, int(round(score)))), raisons


def _extraire_top_competences(competences_tech: dict, limit: int = 4):
    competences_utiles = _extraire_competences_tech(competences_tech)
    if not competences_utiles:
        return []
    try:
        items = sorted(competences_utiles.items(), key=lambda item: item[1], reverse=True)
    except Exception:
        items = list(competences_utiles.items())
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
    historiques = _charger_historique_techniciens(tous_techniciens, db)

    scores = []
    for tech in tous_techniciens:
        if _est_admin(tech) or not _est_profil_technicien(tech):
            continue
        competences_tech = tech.competences or {}
        score, raisons = _calculer_score_technicien(
            tech,
            competences_tech,
            technologies,
            systemes_impactes,
            historiques.get(str(tech.id)),
        )
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
    historiques = _charger_historique_techniciens(tous_techniciens, db)

    scores = []
    for tech in tous_techniciens:
        if _est_admin(tech) or not _est_profil_technicien(tech):
            continue
        competences_tech = tech.competences or {}
        historique = historiques.get(str(tech.id), {})
        score, raisons = _calculer_score_technicien(
            tech,
            competences_tech,
            technologies,
            systemes_impactes,
            historique,
        )
        scores.append({
            "technicien": tech,
            "score": score,
            "raisons": raisons,
            "top_competences": _extraire_top_competences(competences_tech),
            "historique": historique,
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
            "historique": {
                "tickets_resolus": int(item["historique"].get("resolved_count", 0) or 0),
                "tickets_assignes": int(item["historique"].get("all_assigned_count", 0) or 0),
                "score_difficulte_moyen": item["historique"].get("avg_score_difficulte", 0.0),
            },
        }
        for item in scores[:limit]
    ]
