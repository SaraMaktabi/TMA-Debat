from __future__ import annotations

import re
from typing import Any


_TECH_ALIAS_PATTERNS: dict[str, tuple[str, ...]] = {
    "frontend": (r"\bfrontend\b", r"\bfront\b", r"\bui\b", r"\binterface\b", r"\breact\b", r"\bvue\b", r"\bangular\b", r"\bcss\b", r"\bhtml\b"),
    "backend": (r"\bbackend\b", r"\bback\b", r"\bapi\b", r"\bserver\b", r"\bpython\b", r"\bfastapi\b", r"\bdjango\b", r"\bflask\b", r"\bnode\.?js\b"),
    "database": (r"\bdatabase\b", r"\bbdd\b", r"\bbase de donnee\b", r"\bsql\b", r"\bpostgresql\b", r"\bmysql\b", r"\boracle\b"),
    "devops": (r"\bdocker\b", r"\bkubernetes\b", r"\bdeploiement\b", r"\bdeployment\b", r"\bcicd\b", r"\bcloud\b", r"\binfra\b"),
    "security": (r"\bsecurity\b", r"\bsecurite\b", r"\bcyber\w*\b", r"\bauth\b", r"\bauthentification\b", r"\bsiem\b"),
    "network": (r"\breseau\b", r"\br[eé]seau\b", r"\bnetwork\b", r"\brouter\b", r"\bswitch\b", r"\btcp/ip\b"),
    "support": (r"\bsupport\b", r"\bhelpdesk\b", r"\bservice desk\b", r"\bdepannage\b", r"\btroubleshoot\w*\b"),
}

_ACTION_PATTERNS = (
    r"\banalyser\b",
    r"\bdiagnostiquer\b",
    r"\btester\b",
    r"\bv[eé]rifier\b",
    r"\bcorriger\b",
    r"\boptimiser\b",
    r"\bproposer\b",
    r"\bconfigurer\b",
    r"\brefactor\w*\b",
    r"\bd[eé]bug\w*\b",
    r"\bmesurer\b",
    r"\bdocumenter\b",
    r"\brequ[eê]te\b",
    r"\bindex\b",
    r"\bcache\b",
    r"\blog\w*\b",
    r"\btimeout\b",
)

_GENERIC_PATTERNS = (
    r"\bje peux aider\b",
    r"\bje peux aider avec ce ticket\b",
    r"\bj'en ai l'experience\b",
    r"\bmerci\b",
    r"\bsuper\b",
    r"\bok\b",
)


def _normaliser_texte(texte: Any) -> str:
    if not isinstance(texte, str):
        return ""
    cleaned = texte.replace("\u00a0", " ")
    cleaned = re.sub(r"\s+", " ", cleaned)
    return cleaned.strip().lower()


def _competence_text(technicien) -> str:
    competences = getattr(technicien, "competences", {})
    if isinstance(competences, dict):
        valeurs = [str(key) for key in competences.keys() if not str(key).startswith("_")]
        valeurs.extend(
            str(value)
            for key, value in competences.items()
            if not str(key).startswith("_") and isinstance(value, (str, int, float))
        )
        meta = competences.get("_meta", {})
        if isinstance(meta, dict):
            valeurs.extend(str(value) for value in meta.values() if isinstance(value, (str, int, float)))
        return _normaliser_texte(" ".join(valeurs))
    return _normaliser_texte(competences)


def _ticket_keywords(ticket) -> list[str]:
    analyse_nlp = getattr(ticket, "analyse_nlp", None) or {}
    keywords: list[str] = []
    for item in analyse_nlp.get("technologies", []) or []:
        if isinstance(item, str) and item.strip():
            keywords.append(item.strip().lower())
    for item in analyse_nlp.get("systemes_impactes", []) or []:
        if isinstance(item, str) and item.strip():
            keywords.append(item.strip().lower())
    titre = getattr(ticket, "titre", "") or ""
    description = getattr(ticket, "description", "") or ""
    combined = _normaliser_texte(f"{titre} {description}")
    for label, patterns in _TECH_ALIAS_PATTERNS.items():
        if any(re.search(pattern, combined, flags=re.IGNORECASE) for pattern in patterns):
            keywords.append(label)
    return sorted(set(keywords))


def _compatibilite_technicien(ticket, technicien) -> int:
    keywords = _ticket_keywords(ticket)
    competence_text = _competence_text(technicien)
    cv_text = _normaliser_texte(getattr(technicien, "cv_texte", ""))

    score = 35.0
    if not keywords:
        keywords = ["general"]

    matches = 0
    for keyword in keywords:
        patterns = _TECH_ALIAS_PATTERNS.get(keyword, (rf"\b{re.escape(keyword)}\b",))
        if any(
            re.search(pattern, competence_text, flags=re.IGNORECASE)
            or re.search(pattern, cv_text, flags=re.IGNORECASE)
            for pattern in patterns
        ):
            matches += 1

    if matches:
        score += min(45.0, 18.0 * matches)

    if re.search(r"\bexperience\b|\bexpérience\b|\bsenior\b|\bexpert\b", cv_text):
        score += 8.0

    if re.search(r"\bpython\b|\breact\b|\bsql\b|\bdocker\b|\bapi\b", competence_text + " " + cv_text):
        score += 8.0

    return int(max(0, min(100, round(score))))


def _qualite_debat_technicien(ticket, historique: list, technicien) -> tuple[int, list[str]]:
    nom_complet = f"{getattr(technicien, 'prenom', '')} {getattr(technicien, 'nom', '')}".strip().lower()
    messages = []
    for msg in historique or []:
        if not isinstance(msg, dict):
            continue
        agent_nom = _normaliser_texte(msg.get("agent_nom", ""))
        contenu = _normaliser_texte(msg.get("contenu", ""))
        if agent_nom == nom_complet and contenu:
            messages.append(contenu)

    if not messages:
        return 20, ["Peu ou pas de prise de parole dans le débat"]

    keywords = _ticket_keywords(ticket)
    combined = " ".join(messages)
    score = 18.0
    raisons: list[str] = []

    if len(messages) >= 2:
        score += 8.0
        raisons.append("Participation régulière")

    longueur = len(combined)
    if longueur > 120:
        score += 8.0
        raisons.append("Réponses développées")
    elif longueur > 60:
        score += 4.0

    action_matches = sum(1 for pattern in _ACTION_PATTERNS if re.search(pattern, combined, flags=re.IGNORECASE))
    if action_matches:
        score += min(20.0, action_matches * 4.0)
        raisons.append("Propositions techniques concrètes")

    ticket_matches = 0
    for keyword in keywords:
        if keyword and re.search(rf"\b{re.escape(keyword)}\b", combined, flags=re.IGNORECASE):
            ticket_matches += 1
    if ticket_matches:
        score += min(18.0, ticket_matches * 6.0)
        raisons.append("Référence au contexte du ticket")

    generic_hits = sum(1 for pattern in _GENERIC_PATTERNS if re.search(pattern, combined, flags=re.IGNORECASE))
    if generic_hits:
        score -= min(20.0, generic_hits * 8.0)

    if len(combined.strip()) < 25:
        score -= 8.0

    return int(max(0, min(100, round(score)))), raisons


def score_fallback_juge(ticket, historique: list, techniciens: list) -> dict:
    if not techniciens:
        return {
            "gagnant_nom": "",
            "scores": {},
            "justification": "Aucun technicien disponible pour l'évaluation de secours.",
            "confiance": "basse",
        }

    scores: dict[str, int] = {}
    details: list[tuple[str, int, int, list[str]]] = []

    for technicien in techniciens:
        nom = f"{technicien.prenom} {technicien.nom}".strip()
        compatibilite = _compatibilite_technicien(ticket, technicien)
        qualite_debat, raisons = _qualite_debat_technicien(ticket, historique, technicien)
        score_final = int(max(0, min(100, round(0.6 * compatibilite + 0.4 * qualite_debat))))
        scores[nom] = score_final
        details.append((nom, score_final, compatibilite, raisons))

    details.sort(key=lambda item: (-item[1], -item[2], item[0]))
    gagnant_nom = details[0][0]
    meilleurs_raisons = details[0][3]
    justification_parts = [f"{nom}: {score}/100" for nom, score, _, _ in details]
    if meilleurs_raisons:
        justification_parts.append("Critères dominants: " + ", ".join(meilleurs_raisons))

    return {
        "gagnant_nom": gagnant_nom,
        "scores": scores,
        "justification": " | ".join(justification_parts),
        "confiance": "moyenne" if any(score >= 60 for score in scores.values()) else "basse",
    }