from openai import OpenAI
import json
from app.core.config import config
from app.agents.juge_utils import score_fallback_juge

client = OpenAI(api_key=config.OPENAI_API_KEY)

async def evaluer_debat(ticket, historique: list, techniciens: list) -> dict:
    """Analyse le débat et propose un gagnant"""
    
    historique_texte = ""
    for msg in historique:
        historique_texte += f"{msg['agent_nom']} (Tour {msg['tour']}): {msg['contenu']}\n"
    
    profils_texte = ""
    for tech in techniciens:
        profils_texte += f"- {tech.prenom} {tech.nom}: Compétences {tech.competences}\n"
    
    prompt = f"""
    Tu es un arbitre expert en gestion d'incidents. Analyse ce débat.
    
    TICKET:
    Titre: {ticket.titre}
    Description: {ticket.description}
    Score de difficulté: {ticket.score_difficulte}/100
    
    TECHNICIENS:
    {profils_texte}
    
    DÉBAT:
    {historique_texte}
    
    CRITÈRES D'ÉVALUATION:
    1. Pertinence des compétences par rapport au ticket (40%)
    2. Qualité des arguments (logique, expérience) (35%)
    3. Proactivité et contre-argumentation (25%)
    
    Réponds UNIQUEMENT au format JSON:
    {{
        "gagnant_id": "uuid",
        "gagnant_nom": "nom du gagnant",
        "scores": {{
            "nom_technicien1": 75,
            "nom_technicien2": 68
        }},
        "justification": "explication détaillée de la décision",
        "recommandation": "conseil final pour l'administrateur"
    }}
    """
    
    try:
        response = client.chat.completions.create(
            model=config.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "Tu es un arbitre impartial. Réponds uniquement en JSON valide."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=500,
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"❌ Erreur juge: {e}")
        resultat = score_fallback_juge(ticket, historique, techniciens)
        gagnant_nom = resultat.get("gagnant_nom", "")
        gagnant = next((t for t in techniciens if f"{t.prenom} {t.nom}" == gagnant_nom), techniciens[0])
        return {
            "gagnant_id": str(gagnant.id),
            "gagnant_nom": gagnant_nom or f"{gagnant.prenom} {gagnant.nom}",
            "scores": resultat.get("scores", {}),
            "justification": f"Décision automatique par fallback. {resultat.get('justification', '')}".strip(),
            "recommandation": "Le technicien le mieux aligné avec le ticket et le débat a été retenu.",
        }
