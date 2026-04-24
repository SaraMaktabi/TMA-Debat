"""
Agent Juge indépendant utilisant Qwen3-8B (local via Ollama)
Élimine le biais envers GPT-4o-mini
"""
import aiohttp
import json
import re
from app.core.config import config

async def evaluer_debat(ticket, historique: list, techniciens: list) -> dict:
    """
    Analyse le débat avec Qwen3-8B (modèle différent de GPT)
    Pas de biais car LLM différent des agents
    """
    
    # Formater l'historique
    historique_texte = ""
    for msg in historique:
        historique_texte += f"{msg['agent_nom']}: {msg['contenu']}\n"
    
    # Formater les profils
    profils_texte = ""
    for tech in techniciens:
        profils_texte += f"- {tech.prenom} {tech.nom}: Compétences {json.dumps(tech.competences, ensure_ascii=False)}\n"
    
    prompt = f"""
Tu es un ARBITRE EXPERT et IMPARTIAL. Tu dois analyser ce débat SANS AUCUN BIAIS.

⚠️ RÈGLES STRICTES ⚠️
1. Tu NE DOIS PAS favoriser un technicien basé sur le modèle IA qui l'a généré
2. Base-toi UNIQUEMENT sur la QUALITÉ des arguments et les COMPÉTENCES réelles
3. Si un argument est vague ou non pertinent, ignore-le

TICKET À ANALYSER:
Titre: {ticket.titre}
Description: {ticket.description}
Score de difficulté: {ticket.score_difficulte}/100
Technologies détectées: {ticket.analyse_nlp.get('technologies', []) if ticket.analyse_nlp else []}

PROFILS DES TECHNICIENS:
{profils_texte}

DÉBAT COMPLET:
{historique_texte}

CRITÈRES D'ÉVALUATION (pondération égale):
1. Pertinence des compétences - Le technicien a-t-il les compétences requises ?
2. Qualité des arguments - Les arguments sont-ils techniques, précis, pertinents ?
3. Contre-argumentation - Le technicien a-t-il su répondre aux objections ?
4. Proactivité - Le technicien propose-t-il des solutions concrètes ?

INSTRUCTIONS IMPORTANTES:
- Ne mentionne JAMAIS le modèle IA (GPT, Qwen, etc.) dans ta justification
- Base-toi UNIQUEMENT sur le contenu des messages
- Sois OBJECTIF et JUSTE

RÉPONDS UNIQUEMENT AU FORMAT JSON (sans texte avant ou après):
{{
    "gagnant_nom": "nom complet du gagnant",
    "scores": {{
        "Sophie Martin": 75,
        "Thomas Dubois": 68
    }},
    "justification": "explication détaillée basée uniquement sur les arguments (50-100 mots)",
    "confiance": "haute|moyenne|basse"
}}
"""
    
    try:
        # Appel à Qwen3 local via Ollama
        async with aiohttp.ClientSession() as session:
            async with session.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": "qwen3:8b",
                    "prompt": prompt,
                    "stream": False,
                    "temperature": 0.2,  # Bas pour objectivité
                    "max_tokens": 1000
                }
            ) as response:
                resultat = await response.json()
                reponse = resultat.get("response", "")
                
                # Extraire le JSON de la réponse
                json_match = re.search(r'\{.*\}|\{[\s\S]*\}', reponse, re.DOTALL)
                if json_match:
                    resultat_json = json.loads(json_match.group())
                    print(f"✅ Juge Qwen3: {resultat_json.get('gagnant_nom', '?')} gagnant")
                    return resultat_json
                else:
                    raise ValueError("Format JSON invalide")
                    
    except Exception as e:
        print(f"❌ Erreur juge Qwen3: {e}")
        # Fallback: décision basée sur règles simples
        print("⚠️ Fallback: décision par règles")
        return await _fallback_decision(ticket, historique, techniciens)


async def _fallback_decision(ticket, historique: list, techniciens: list) -> dict:
    """
    Décision de fallback basée sur des règles simples (pas d'IA)
    """
    from app.agents.profil import recommander_techniciens
    from app.database import SessionLocal
    
    db = SessionLocal()
    try:
        analyse_nlp = ticket.analyse_nlp or {"technologies": [], "systemes_impactes": []}
        meilleurs = recommander_techniciens(analyse_nlp, db, limit=1)
        
        if meilleurs:
            gagnant = meilleurs[0]
            gagnant_nom = f"{gagnant.prenom} {gagnant.nom}"
        else:
            gagnant = techniciens[0]
            gagnant_nom = f"{gagnant.prenom} {gagnant.nom}"
            
        return {
            "gagnant_nom": gagnant_nom,
            "scores": {f"{t.prenom} {t.nom}": 50 for t in techniciens},
            "justification": "Décision automatique par fallback (Qwen3 indisponible)",
            "confiance": "basse"
        }
    finally:
        db.close()
