from openai import OpenAI
import json
from app.core.config import config

client = OpenAI(api_key=config.OPENAI_API_KEY)

async def calculer_score(titre: str, description: str, priorite: str, environnement: str) -> dict:
    prompt = f"""
    Analyse ce ticket d'incident et donne un score de difficulté de 0 à 100.
    
    TITRE: {titre}
    DESCRIPTION: {description}
    PRIORITÉ: {priorite}
    ENVIRONNEMENT: {environnement}
    
    Réponds UNIQUEMENT au format JSON:
    {{"score": ..., "facteurs": ["facteur1", "facteur2", "facteur3"]}}
    """
    
    try:
        response = client.chat.completions.create(
            model=config.OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=200,
            response_format={"type": "json_object"}
        )
        resultat = json.loads(response.choices[0].message.content)
        return {"score": min(100, max(0, resultat.get("score", 50))), "facteurs": resultat.get("facteurs", [])}
    except Exception as e:
        print(f"Erreur scorer: {e}")
        score = 50
        if priorite == "P1": score += 30
        elif priorite == "P2": score += 15
        if environnement == "PROD": score += 20
        return {"score": min(100, score), "facteurs": ["fallback_mode"]}
