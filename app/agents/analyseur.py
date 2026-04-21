
from openai import OpenAI
import json
from app.core.config import config

client = OpenAI(api_key=config.OPENAI_API_KEY)

async def analyser_technologies(titre: str, description: str) -> dict:
    """
    Extrait les technologies, type d'incident et urgence d'un ticket
    Utilise GPT-4o-mini pour l'analyse NLP
    """
    
    prompt = f"""
    Analyse ce ticket d'incident et extrait les informations techniques.
    
    TITRE: {titre}
    DESCRIPTION: {description}
    
    Réponds UNIQUEMENT au format JSON (sans texte avant ou après):
    {{
        "technologies": ["Python", "PostgreSQL", "Docker"],
        "type_incident": "bug|performance|securite|donnees|autre",
        "systemes_impactes": ["API", "base de données", "frontend"],
        "urgence_percue": "basse|moyenne|haute|critique",
        "mots_cles": ["crash", "timeout", "erreur"]
    }}
    
    Règles:
    - technologies: langages, frameworks, bases de données mentionnés
    - type_incident: choisir UN seul parmi les options
    - systemes_impactes: quels composants sont affectés
    - urgence_percue: niveau d'urgence ressenti dans la description
    - mots_cles: 3-5 mots importants du ticket
    """
    
    try:
        response = client.chat.completions.create(
            model=config.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "Tu es un expert en analyse technique d'incidents. Réponds uniquement en JSON valide."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=400,
            response_format={"type": "json_object"}
        )
        
        resultat = json.loads(response.choices[0].message.content)
        
        # Validation des champs obligatoires
        return {
            "technologies": resultat.get("technologies", []),
            "type_incident": resultat.get("type_incident", "autre"),
            "systemes_impactes": resultat.get("systemes_impactes", []),
            "urgence_percue": resultat.get("urgence_percue", "moyenne"),
            "mots_cles": resultat.get("mots_cles", [])
        }
        
    except Exception as e:
        print(f"❌ Erreur analyseur: {e}")
        # Fallback en cas d'erreur
        return {
            "technologies": [],
            "type_incident": "autre",
            "systemes_impactes": [],
            "urgence_percue": "moyenne",
            "mots_cles": []
        }
