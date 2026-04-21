from openai import OpenAI
import json
from app.core.config import config

client = OpenAI(api_key=config.OPENAI_API_KEY)

async def evaluer_debat(ticket, historique: list, techniciens: list) -> dict:
    """Analyse le débat et propose un gagnant"""
    
    historique_texte = ""
    for msg in historique:
        historique_texte += f"{msg['agent_nom']} (Tour {msg['tour']}): {msg['contenu']}\n"
    
    profils_texte = ""
    for tech in techniciens:
        profils_texte += f"- {tech.prenom} {tech.nom}: {tech.competences}\n"
    
    prompt = f"""
    Tu es un arbitre. Analyse ce débat et désigne un gagnant.
    
    TICKET: {ticket.titre} - {ticket.description}
    
    TECHNICIENS:
    {profils_texte}
    
    DÉBAT:
    {historique_texte}
    
    CRITÈRES:
    - Pertinence des compétences (40%)
    - Qualité des arguments (35%)
    - Contre-argumentation (25%)
    
    Réponds UNIQUEMENT au format JSON:
    {{
        "gagnant_id": "uuid",
        "gagnant_nom": "nom du gagnant",
        "scores": {{"nom1": 75, "nom2": 68}},
        "justification": "explication",
        "recommandation": "conseil"
    }}
    """
    
    try:
        response = client.chat.completions.create(
            model=config.OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=500,
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"Erreur juge: {e}")
        return {
            "gagnant_id": str(techniciens[0].id),
            "gagnant_nom": f"{techniciens[0].prenom} {techniciens[0].nom}",
            "scores": {},
            "justification": "Décision automatique",
            "recommandation": "Le premier technicien est choisi"
        }
